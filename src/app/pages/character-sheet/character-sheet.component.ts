import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CharacterService, Character, PericiaInfo, AcaoInfo, PersonagemEquipamentoInfo } from '../../services/character.service';

export interface PericiaView {
  id: number;
  nome: string;
  modificadorAtributo: string;
  proficiente: boolean;
  maestria: boolean;
  origem?: string;
}

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.scss'
})
export class CharacterSheetComponent implements OnInit, OnDestroy {
  charId: string = '';
  character: Character | undefined;
  pericias: PericiaView[] = [];
  currentHp: number = 0;
  maxHp: number = 0;
  tempHp: number = 0;
  hpInputVal: number = 1;
  activeTab: string = 'ficha'; // 'ficha', 'actions', 'traits' ou 'spells'
  exibirEmFeet: boolean = false;
  selectedTrait: any = null;
  selectedAction: any = null;
  selectedSpell: any = null;

  // Equipamentos state
  selectedEquipamento: any = null;
  
  // Confirmation Modal state
  confirmArmaduraModalOpen = false;
  pendingEquipId: number | null = null;
  confirmArmaduraMessage = '';

  // Custom Toast state
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;
  
  // Collapsible sections state (starts closed by default)
  expandedSections: { [key: string]: boolean } = {};

  toggleSection(key: string): void {
    this.expandedSections[key] = !this.expandedSections[key];
  }

  isSectionExpanded(key: string): boolean {
    return !!this.expandedSections[key];
  }

  getClassFeatures(classe: any): any[] {
    if (!classe || !classe.caracteristicas) return [];
    return classe.caracteristicas.filter((c: any) => c.idClasse === classe.idClasse);
  }

  getSubclassFeatures(classe: any): any[] {
    if (!classe || !classe.caracteristicas) return [];
    return classe.caracteristicas.filter((c: any) => c.idClasse === classe.idSubclasse);
  }

  private routeSub: Subscription | undefined;

  openTraitModal(trait: any): void {
    this.selectedTrait = trait;
    this.updateBodyScroll();
  }

  closeTraitModal(): void {
    this.selectedTrait = null;
    this.updateBodyScroll();
  }

  openActionModal(action: any): void {
    this.selectedAction = action;
    this.updateBodyScroll();
  }

  closeActionModal(): void {
    this.selectedAction = null;
    this.updateBodyScroll();
  }

  openSpellModal(spell: any): void {
    this.selectedSpell = spell;
    this.updateBodyScroll();
  }

  closeSpellModal(): void {
    this.selectedSpell = null;
    this.updateBodyScroll();
  }

  getSpellSlotsInfo(): { classe: string, espacos: number, nivelMagia: number }[] {
    if (!this.character || !this.character.classes) return [];
    return this.character.classes
      .filter(c => c.progresso && c.progresso.espacosMagia > 0)
      .map(c => ({
        classe: c.nome,
        espacos: c.progresso!.espacosMagia,
        nivelMagia: c.progresso!.nivelMagia
      }));
  }

  getSpellsByLevel(level: number): any[] {
    if (!this.character || !this.character.magias) return [];
    return this.character.magias.filter(m => m.nivel === level);
  }

  getSpellsLevel1Plus(): any[] {
    if (!this.character || !this.character.magias) return [];
    return this.character.magias.filter(m => m.nivel > 0);
  }

  formatSpellDescription(desc: string): string {
    if (!desc) return '';
    return desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  getSpellcastingAbilityName(): string {
    if (!this.character || !this.character.classes || this.character.classes.length === 0) return 'Carisma';
    const mainClass = this.character.classes[0].nome.toLowerCase();
    if (mainClass === 'bruxo' || mainClass === 'bardo' || mainClass === 'feiticeiro' || mainClass === 'paladino') {
      return 'Carisma';
    }
    if (mainClass === 'mago') {
      return 'Inteligência';
    }
    if (mainClass === 'clerigo' || mainClass === 'druida' || mainClass === 'patrulheiro') {
      return 'Sabedoria';
    }
    return 'Carisma';
  }

  getSpellcastingAbilityAbbrev(): string {
    const name = this.getSpellcastingAbilityName();
    switch (name) {
      case 'Carisma': return 'CAR';
      case 'Inteligência': return 'INT';
      case 'Sabedoria': return 'SAB';
      default: return 'CAR';
    }
  }

  getSpellcastingModifierValue(): number {
    if (!this.character) return 0;
    const attrName = this.getSpellcastingAbilityName();
    const attrValue = this.getAttrValueByPortugueseName(attrName);
    return this.getModifier(attrValue);
  }

  getSpellSaveDC(): number {
    return 8 + this.proficiencyBonus + this.getSpellcastingModifierValue();
  }

  getSpellAttackBonus(): string {
    const val = this.proficiencyBonus + this.getSpellcastingModifierValue();
    return val >= 0 ? `+${val}` : `${val}`;
  }

  parseTooltip(template: string | undefined): string {
    if (!template) return '';
    let result = template;
    
    const attrs = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
    for (const attr of attrs) {
      const val = this.getAttrValueByPortugueseName(attr);
      const mod = this.getModifier(val);
      const signedMod = this.formatModifier(mod);
      const unsignedMod = Math.abs(mod).toString();
      
      result = result.replace(new RegExp(`\\[${attr}\\]`, 'g'), signedMod);
      result = result.replace(new RegExp(`\\[${attr}_UNSIG\\]`, 'g'), unsignedMod);
    }
    
    const prof = this.proficiencyBonus;
    result = result.replace(/\[PROF\]/g, `${prof}`);
    
    result = result.replace(/\+\s*-/g, '- ');
    
    return result;
  }

  constructor(
    private route: ActivatedRoute,
    private charService: CharacterService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.charId = params['name'] || '';
      if (this.charId) {
        this.loadCharacterData();
      }
    });
  }

  loadCharacterData(): void {
    this.charService.getCharacterFicha(this.charId).subscribe(char => {
      if (char) {
        this.character = char;
        // Carrega as perícias calculadas diretamente do personagem
        this.pericias = (char.pericias || []).map(p => ({
          id: p.id,
          nome: p.nome,
          modificadorAtributo: p.modificadorAtributo,
          proficiente: p.proficiente,
          maestria: p.maestria,
          origem: p.origem
        }));

        // Utiliza a vida máxima e atual que vêm do banco persistido
        this.maxHp = char.sheet.vidaMaxima ?? 10;
        this.currentHp = char.sheet.vidaAtual ?? this.maxHp;
        this.tempHp = 0; // Inicializa vida temporária local
      }
    });
  }

  getModifier(value: number): number {
    return Math.floor((value - 10) / 2);
  }

  formatModifier(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
  }

  toggleSpeedUnit(): void {
    this.exibirEmFeet = !this.exibirEmFeet;
  }

  getSpeedValue(): number {
    if (!this.character) return 9;
    const racaSpeed = this.character.racaInfo?.deslocamento ?? 9;
    let extraSpeed = 0;
    if (this.character.classes) {
      for (const cls of this.character.classes) {
        if (cls.deslocamento) {
          extraSpeed += cls.deslocamento;
        }
      }
    }
    return racaSpeed + extraSpeed;
  }

  getSpeedDisplay(): string {
    const metros = this.getSpeedValue();
    if (this.exibirEmFeet) {
      const feet = Math.round((metros / 1.5) * 5);
      return `${feet} ft`;
    }
    return `${metros}m`;
  }

  getSpeed(character: Character): number {
    return this.getSpeedValue();
  }

  get proficiencyBonus(): number {
    if (!this.character) return 2;
    const level = this.character.sheet.level || 1;
    return Math.floor((level - 1) / 4) + 2;
  }

  getAttrValueByPortugueseName(attrName: string): number {
    if (!this.character) return 10;
    const attrs = this.character.sheet.attributes;
    const name = attrName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    switch (name) {
      case 'forca':
      case 'for':
        return attrs.strength;
      case 'destreza':
      case 'des':
        return attrs.dexterity;
      case 'constituicao':
      case 'con':
        return attrs.constitution;
      case 'inteligencia':
      case 'int':
        return attrs.intelligence;
      case 'sabedoria':
      case 'sab':
        return attrs.wisdom;
      case 'carisma':
      case 'car':
        return attrs.charisma;
      default:
        return 10;
    }
  }

  getSkillModifier(skill: PericiaView): number {
    if (!this.character) return 0;
    const baseAttrValue = this.getAttrValueByPortugueseName(skill.modificadorAtributo);
    const baseMod = this.getModifier(baseAttrValue);
    const profBonus = this.proficiencyBonus;

    let bonus = 0;
    if (skill.maestria) {
      bonus = profBonus * 2;
    } else if (skill.proficiente) {
      bonus = profBonus;
    }

    return baseMod + bonus;
  }

  // Ciclo de 3 Estados: Vazio -> Proficiente -> Maestria -> Vazio
  cycleProficiency(skill: PericiaView): void {
    if (!skill.proficiente && !skill.maestria) {
      // Vazio -> Proficiente
      skill.proficiente = true;
      skill.maestria = false;
    } else if (skill.proficiente && !skill.maestria) {
      // Proficiente -> Maestria
      skill.proficiente = true;
      skill.maestria = true;
    } else {
      // Maestria -> Vazio
      skill.proficiente = false;
      skill.maestria = false;
    }
  }

  getSkillTitle(skill: PericiaView): string {
    if (skill.maestria) {
      return `Maestria (+${this.proficiencyBonus * 2})`;
    }
    if (skill.proficiente) {
      return `Proficiência (+${this.proficiencyBonus})`;
    }
    return 'Sem proficiência (Modificador base)';
  }

  getSkillTooltip(skill: PericiaView): string {
    const baseTitle = this.getSkillTitle(skill);
    if (skill.origem) {
      return `${baseTitle} | Origem: ${skill.origem}`;
    }
    return baseTitle;
  }

  getActionsByType(type: string): AcaoInfo[] {
    if (!this.character) return [];
    const baseActions = this.character.acoes ? [...this.character.acoes] : [];
    
    // Adiciona "Raio místico" se o personagem o possuir nas suas magias
    if (type.toLowerCase() === 'ação' && this.character.magias) {
      const temRaioMistico = this.character.magias.some(m => m.nome.toLowerCase() === 'raio místico');
      if (temRaioMistico) {
        const charisMod = this.getSpellcastingModifierValue();
        const danoSuffix = charisMod > 0 ? `+${charisMod}` : '';
        const raioAction: AcaoInfo = {
          id: 999,
          nome: 'Raio místico',
          tipoAcao: 'Ação',
          alcance: '36m / 120ft',
          bonusAcerto: this.getSpellAttackBonus(),
          dano: `1d10${danoSuffix}`,
          tipoDano: 'Energia',
          descricao: 'Um feixe de energia estalante vai em direção a uma criatura. Faça um ataque à distância com magia. Com um acerto, o alvo sofre 1d10 de dano de energia. Explosão Agonizante: Você adiciona seu Modificador de Carisma ao dano.',
          acertoTooltip: '[CAR](CAR) + [PROF](Proficiência)',
          danoTooltip: '1d10 + [CAR_UNSIG](CAR)'
        };
        baseActions.push(raioAction);
      }
    }

    // Adiciona armas equipadas dinamicamente
    if (this.character.equipamentos) {
      const equippedWeapons = this.character.equipamentos.filter(
        pe => pe.isEquipado && pe.equipamento.tipoEquipamento === 'Arma'
      );

      const modStr = this.getModifier(this.getAttrValueByPortugueseName('Força'));
      const modDex = this.getModifier(this.getAttrValueByPortugueseName('Destreza'));
      const prof = this.proficiencyBonus;

      equippedWeapons.forEach((pe, index) => {
        const eq = pe.equipamento;
        const isFinesse = eq.propriedades.some(p => p.toLowerCase() === 'acuidade');
        
        // Escolhe o atributo de ataque
        let atkAttr = 'FOR';
        let atkMod = modStr;
        if (isFinesse && modDex > modStr) {
          atkAttr = 'DES';
          atkMod = modDex;
        }

        const totalAtk = atkMod + prof;
        const signedAtk = totalAtk >= 0 ? `+${totalAtk}` : `${totalAtk}`;

        // Regra de Duas Armas (Dual Wielding)
        // Se temos duas armas, a segunda (index 1) vai para a mão secundária (Ação Bônus)
        const isSecondary = index === 1;
        const actionType = isSecondary ? 'Ação Bônus' : 'Ação';
        const displayName = isSecondary ? `${eq.nome} (Mão Secundária)` : eq.nome;

        // Dano
        let finalDmg = eq.dano || '1d4';
        let dmgTooltip = `${eq.dano || '1d4'}`;

        if (isSecondary) {
          // Mão secundária não soma modificador positivo
          if (atkMod < 0) {
            finalDmg += `${atkMod}`;
            dmgTooltip += ` - [${atkAttr}_UNSIG](${atkAttr})`;
          }
        } else {
          // Mão primária soma modificador
          if (atkMod > 0) {
            finalDmg += `+${atkMod}`;
            dmgTooltip += ` + [${atkAttr}_UNSIG](${atkAttr})`;
          } else if (atkMod < 0) {
            finalDmg += `${atkMod}`;
            dmgTooltip += ` - [${atkAttr}_UNSIG](${atkAttr})`;
          }
        }

        const weaponAction: AcaoInfo = {
          id: 1000 + pe.id,
          nome: displayName,
          tipoAcao: actionType,
          alcance: '1.5m / 5ft',
          bonusAcerto: signedAtk,
          dano: finalDmg,
          tipoDano: eq.tipoDano || 'Impacto',
          descricao: eq.descricao || `Ataque físico usando ${eq.nome}.`,
          acertoTooltip: `[${atkAttr}](${atkAttr}) + [PROF](Proficiência)`,
          danoTooltip: dmgTooltip
        };

        baseActions.push(weaponAction);
      });
    }
    
    return baseActions.filter(a => a.tipoAcao.toLowerCase() === type.toLowerCase());
  }

  getGroupedProficiencies(): { tipo: string, itens: any[] }[] {
    if (!this.character || !this.character.proficiencias) return [];
    const groups: { [key: string]: any[] } = {};
    for (const p of this.character.proficiencias) {
      const tipoPlural = p.tipo === 'Arma' ? 'Armas' : p.tipo === 'Armadura' ? 'Armaduras' : 'Ferramentas';
      if (!groups[tipoPlural]) {
        groups[tipoPlural] = [];
      }
      groups[tipoPlural].push(p);
    }
    return Object.keys(groups).map(key => ({
      tipo: key,
      itens: groups[key]
    }));
  }

  applyDamage(): void {
    const amount = Math.max(1, this.hpInputVal);
    this.damage(amount);
  }

  applyHeal(): void {
    const amount = Math.max(1, this.hpInputVal);
    this.heal(amount);
  }

  heal(amount: number): void {
    if (this.currentHp < this.maxHp) {
      const missing = this.maxHp - this.currentHp;
      if (amount <= missing) {
        this.currentHp += amount;
      } else {
        this.currentHp = this.maxHp;
        this.tempHp += (amount - missing);
      }
    } else {
      this.tempHp += amount;
    }
  }

  damage(amount: number): void {
    if (this.tempHp > 0) {
      if (amount <= this.tempHp) {
        this.tempHp -= amount;
      } else {
        const diff = amount - this.tempHp;
        this.tempHp = 0;
        this.currentHp = Math.max(0, this.currentHp - diff);
      }
    } else {
      this.currentHp = Math.max(0, this.currentHp - amount);
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  openEquipamentoModal(pe: any): void {
    this.selectedEquipamento = pe;
    this.updateBodyScroll();
  }

  closeEquipamentoModal(): void {
    this.selectedEquipamento = null;
    this.updateBodyScroll();
  }

  getClasseArmadura(): number {
    if (!this.character) return 10;
    
    const armadura = this.character.equipamentos?.find(
      pe => pe.isEquipado && pe.equipamento.tipoEquipamento === 'Armadura'
    );
    
    const escudo = this.character.equipamentos?.find(
      pe => pe.isEquipado && pe.equipamento.tipoEquipamento === 'Escudo'
    );

    const modDex = this.getModifier(this.getAttrValueByPortugueseName('Destreza'));
    let ca = 10;

    if (armadura) {
      ca = armadura.equipamento.classeArmadura ?? 10;
      if (armadura.equipamento.permiteDestreza) {
        ca += modDex;
      }
    } else {
      ca = 10 + modDex;
    }

    if (escudo) {
      ca += escudo.equipamento.modificadorClasseArmadura ?? 2;
    }

    return ca;
  }

  toggleEquip(pe: PersonagemEquipamentoInfo): void {
    if (pe.isEquipado) {
      this.desequipar(pe);
    } else {
      this.equipar(pe);
    }
  }

  equipar(pe: PersonagemEquipamentoInfo, confirm: boolean = false): void {
    if (!this.character) return;
    this.charService.equiparEquipamento(this.charId, pe.id, confirm).subscribe({
      next: (res) => {
        if (res.requiresConfirmation) {
          this.pendingEquipId = pe.id;
          this.confirmArmaduraMessage = res.message;
          this.confirmArmaduraModalOpen = true;
          this.updateBodyScroll();
        } else {
          this.showToast(res.message || 'Item equipado com sucesso.', 'success');
          this.loadCharacterData();
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Erro ao equipar item.';
        this.showToast(errorMsg, 'error');
      }
    });
  }

  desequipar(pe: PersonagemEquipamentoInfo): void {
    if (!this.character) return;
    this.charService.desequiparEquipamento(this.charId, pe.id).subscribe({
      next: (res) => {
        this.showToast(res.message || 'Item desequipado com sucesso.', 'success');
        this.loadCharacterData();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Erro ao desequipar item.';
        this.showToast(errorMsg, 'error');
      }
    });
  }

  confirmSubstituteArmadura(): void {
    if (this.pendingEquipId === null) return;
    
    const pe = this.character?.equipamentos?.find(x => x.id === this.pendingEquipId);
    if (pe) {
      this.equipar(pe, true);
    }
    this.confirmArmaduraModalOpen = false;
    this.pendingEquipId = null;
    this.updateBodyScroll();
  }

  cancelSubstituteArmadura(): void {
    this.confirmArmaduraModalOpen = false;
    this.pendingEquipId = null;
    this.updateBodyScroll();
  }

  updateBodyScroll(): void {
    const isModalOpen = !!(
      this.selectedTrait ||
      this.selectedAction ||
      this.selectedSpell ||
      this.selectedEquipamento ||
      this.confirmArmaduraModalOpen
    );
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }
}
