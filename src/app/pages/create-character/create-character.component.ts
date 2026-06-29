import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CharacterService } from '../../services/character.service';

interface Caracteristica {
  id: number;
  nivel: number;
  nome: string;
  descricao: string;
}

interface Subclasse {
  id: number;
  nome: string;
  caracteristicas: Caracteristica[];
}

interface PericiaDisponivel {
  id: number;
  nome: string;
  modificadorAtributo: string;
}

interface ClasseDropdown {
  id: number;
  nome: string;
  dadoVida: string;
  qtdPericiasEscolha: number;
  periciasDisponiveis: PericiaDisponivel[];
  caracteristicas: Caracteristica[];
  subclasses: Subclasse[];
  progressoes?: any[];
}

@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-character.component.html',
  styleUrl: './create-character.component.scss'
})
export class CreateCharacterComponent implements OnInit {
  currentStep: number = 1;

  // Form fields
  nome: string = '';
  codigo: string = '';
  nivel: number = 1;
  alinhamento: string = 'Neutro';
  base64Imagem: string = '';
  
  // Custom HP overrides
  isCustomHp: boolean = false;
  customHp: number = 10;

  // Selection states
  selectedRaceObj: any = null;
  selectedClassObj: ClasseDropdown | null = null;
  selectedSubclassObj: Subclasse | null = null;
  subclasseEscolha: string = '';

  // Attributes Generation Mode & Drag and Drop State
  attributesGenerationMode: 'roll' | 'array' | 'manual' = 'manual';
  draggedValue: number | null = null;
  draggedIndex: number | null = null;

  // Attributes
  attributes = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  };

  // Lists from API
  racasList: any[] = [];
  classesList: ClasseDropdown[] = [];
  equipamentosList: any[] = [];
  magiasList: any[] = [];

  // Perícias & Equipamentos Selection State
  selectedPericias: number[] = [];
  selectedTruques: number[] = [];
  selectedMagias: number[] = [];

  // Warlock choices
  warlockGroup1: string = 'a';
  warlockGroup1Simple: number = 3; // Default to Adaga (Id 3)
  warlockGroup2: string = 'a';
  warlockGroup3: string = 'a';
  warlockFixedSimple: number = 3; // Default to Adaga (Id 3)

  // Monk choices
  monkGroup1: string = 'a';
  monkGroup1Simple: number = 3; // Default to Adaga (Id 3)
  monkGroup2: string = 'a';

  // Dropdown lists
  alinhamentosList: string[] = [
    'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
    'Leal e Neutro', 'Neutro', 'Caótico e Neutro',
    'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau'
  ];

  genioChoices: string[] = ['Dao', 'Djinni', 'Ifriti', 'Marid'];

  // UI States
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;
  
  rolledValues: number[] = [];

  // Race details modal
  showRaceModal: boolean = false;
  modalRaceObj: any = null;

  // Expanded levels in Class config step
  expandedLevels: { [key: number]: boolean } = { 1: true };

  constructor(
    private charService: CharacterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRacas();
    this.loadClasses();
    this.loadEquipamentos();
    this.loadMagias();
  }

  loadRacas(): void {
    this.charService.getRacas().subscribe(data => {
      this.racasList = data;
    });
  }

  loadClasses(): void {
    this.charService.getClasses().subscribe(data => {
      this.classesList = data;
    });
  }

  loadEquipamentos(): void {
    this.charService.getEquipamentos().subscribe(data => {
      this.equipamentosList = data;
    });
  }

  loadMagias(): void {
    this.charService.getMagias().subscribe(data => {
      this.magiasList = data;
    });
  }

  onNomeChange(): void {
    this.codigo = this.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .trim()
      .replace(/\s+/g, "-"); // spaces to dashes
  }

  // Race Selection Handlers
  selectRace(race: any): void {
    this.modalRaceObj = race;
    this.showRaceModal = true;
  }

  confirmRaceSelection(): void {
    this.selectedRaceObj = this.modalRaceObj;
    this.showRaceModal = false;
    this.showToast(`Raça ${this.selectedRaceObj.nome} selecionada!`, 'success');
  }

  // Class Selection Handlers
  selectClass(classe: ClasseDropdown): void {
    this.selectedClassObj = classe;
    this.selectedSubclassObj = null;
    this.subclasseEscolha = '';
    this.selectedPericias = []; // Reset selections
    
    // Autoexpand level 1 config
    this.expandedLevels = { 1: true };
    this.showToast(`Classe ${classe.nome} selecionada. Prossiga para configurar os níveis!`, 'success');
  }

  togglePericia(periciaId: number): void {
    const idx = this.selectedPericias.indexOf(periciaId);
    if (idx > -1) {
      this.selectedPericias.splice(idx, 1);
    } else {
      const limit = this.selectedClassObj?.qtdPericiasEscolha || 0;
      if (this.selectedPericias.length < limit) {
        this.selectedPericias.push(periciaId);
      } else {
        this.showToast(`Você pode escolher no máximo ${limit} perícias.`, 'error');
      }
    }
  }

  isPericiaSelected(periciaId: number): boolean {
    return this.selectedPericias.includes(periciaId);
  }

  getSimpleWeapons(): any[] {
    return this.equipamentosList.filter(e => e.proficienciaRequerida === 'Armas simples' && e.tipoEquipamento === 'Arma');
  }

  getSelectedEquipments(): number[] {
    const list: number[] = [];
    if (!this.selectedClassObj) return list;

    const className = this.selectedClassObj.nome.toLowerCase();
    if (className === 'bruxo') {
      // Group 1: (a) besta leve e 20 virotes ou (b) qualquer arma simples
      if (this.warlockGroup1 === 'a') {
        list.push(8); // Besta Leve
      } else {
        list.push(Number(this.warlockGroup1Simple));
      }
      // Group 2: (a) bolsa de componentes ou (b) foco arcano
      if (this.warlockGroup2 === 'a') {
        list.push(2); // Bolsa de componentes
      } else {
        list.push(9); // Foco Arcano
      }
      // Group 3: (a) pacote de estudioso ou (b) pacote de explorador
      if (this.warlockGroup3 === 'a') {
        list.push(10); // Pacote de estudioso
      } else {
        list.push(11); // Pacote de explorador
      }
      // Fixo: Armadura de couro, qualquer arma simples e duas adagas
      list.push(15); // Armadura de Couro
      list.push(3); // Adaga
      list.push(3); // Adaga (segunda)
      list.push(Number(this.warlockFixedSimple)); // Qualquer arma simples
    } 
    else if (className === 'monge') {
      // Group 1: (a) uma espada curta ou (b) qualquer arma simples
      if (this.monkGroup1 === 'a') {
        list.push(13); // Espada Curta
      } else {
        list.push(Number(this.monkGroup1Simple));
      }
      // Group 2: (a) pacote de explorador ou (b) pacote de aventureiro
      if (this.monkGroup2 === 'a') {
        list.push(11); // Pacote de explorador
      } else {
        list.push(12); // Pacote de aventureiro
      }
      // Fixo: 10 dardos
      list.push(14); // 10 Dardos
    }

    return list;
  }

  onSubclassChange(event: any): void {
    const subName = event.target.value;
    if (this.selectedClassObj && this.selectedClassObj.subclasses) {
      this.selectedSubclassObj = this.selectedClassObj.subclasses.find(s => s.nome === subName) || null;
    } else {
      this.selectedSubclassObj = null;
    }
    this.subclasseEscolha = '';
  }

  getSubclassLevel(classe: ClasseDropdown | null): number {
    if (!classe) return 999;
    if (classe.nome.toLowerCase() === 'bruxo') return 1;
    if (classe.nome.toLowerCase() === 'monge') return 3;
    
    if (!classe.subclasses || classe.subclasses.length === 0) return 999;
    let minLvl = 999;
    for (const s of classe.subclasses) {
      if (s.caracteristicas && s.caracteristicas.length > 0) {
        const lvl = Math.min(...s.caracteristicas.map(c => c.nivel));
        if (lvl < minLvl) minLvl = lvl;
      }
    }
    return minLvl === 999 ? 1 : minLvl;
  }

  get levelsArray(): number[] {
    const arr = [];
    for (let i = 1; i <= this.nivel; i++) {
      arr.push(i);
    }
    return arr;
  }

  toggleLevelExpand(lvl: number): void {
    this.expandedLevels[lvl] = !this.expandedLevels[lvl];
  }

  getLevelFeatures(lvl: number): Caracteristica[] {
    if (!this.selectedClassObj) return [];
    
    // Base class features for this level
    let features = this.selectedClassObj.caracteristicas.filter(c => c.nivel === lvl);
    
    // Subclass features for this level if selected
    if (this.selectedSubclassObj && this.nivel >= this.getSubclassLevel(this.selectedClassObj)) {
      const subFeatures = this.selectedSubclassObj.caracteristicas.filter(c => c.nivel === lvl);
      features = [...features, ...subFeatures];
    }
    
    return features;
  }

  // standard 4d6 drop lowest roll
  roll4d6DropLowest(): number {
    const rolls = [];
    for (let i = 0; i < 4; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    rolls.sort();
    return rolls[1] + rolls[2] + rolls[3]; // sum top 3
  }

  changeGenerationMode(mode: 'roll' | 'array' | 'manual'): void {
    this.attributesGenerationMode = mode;
    this.rolledValues = [];
    
    if (mode === 'manual') {
      this.attributes = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      };
    } else {
      this.attributes = {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
      };
      if (mode === 'array') {
        this.rolledValues = [15, 14, 13, 12, 10, 8];
      }
    }
  }

  onDragStart(event: DragEvent, val: number, index: number): void {
    this.draggedValue = val;
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', val.toString());
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, attrName: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'): void {
    event.preventDefault();
    if (this.draggedValue !== null && this.draggedIndex !== null) {
      const prevVal = this.attributes[attrName];
      this.attributes[attrName] = this.draggedValue;
      this.rolledValues.splice(this.draggedIndex, 1);
      if (prevVal > 0) {
        this.rolledValues.push(prevVal);
      }
      this.draggedValue = null;
      this.draggedIndex = null;
    }
  }

  rollAllAttributes(): void {
    this.changeGenerationMode('roll');
    const rolled = [];
    for (let i = 0; i < 6; i++) {
      rolled.push(this.roll4d6DropLowest());
    }
    rolled.sort((a, b) => b - a);
    this.rolledValues = [...rolled];
    this.showToast('Dados rolados! Arraste os valores para os atributos desejados.', 'success');
  }

  applyStandardArray(): void {
    this.changeGenerationMode('array');
    this.showToast('Valores do Standard Array prontos para arrastar!', 'success');
  }

  get conModifier(): number {
    return Math.floor((this.attributes.constitution - 10) / 2);
  }

  get calculatedHp(): number {
    const conMod = this.conModifier;
    const level = this.nivel;
    
    let hitDie = 8;
    if (this.selectedClassObj && this.selectedClassObj.dadoVida) {
      hitDie = parseInt(this.selectedClassObj.dadoVida.replace('d', '')) || 8;
    }
    
    const average = Math.floor(hitDie / 2) + 1;
    
    let hp = hitDie + conMod;
    if (level > 1) {
      hp += (level - 1) * (average + conMod);
    }
    return Math.max(1, hp);
  }

  get finalHp(): number {
    return this.isCustomHp ? this.customHp : this.calculatedHp;
  }

  get currentProgression(): any {
    if (!this.selectedClassObj || !this.selectedClassObj.progressoes) return null;
    return this.selectedClassObj.progressoes.find((p: any) => p.nivel === this.nivel) || null;
  }

  hasSpells(): boolean {
    const prog = this.currentProgression;
    if (!prog) return false;
    return (prog.truquesConhecidos > 0 || prog.magiasConhecidas > 0);
  }

  getFilteredSpells(nivel: number): any[] {
    if (!this.magiasList) return [];
    if (nivel === 0) {
      return this.magiasList.filter(m => m.nivel === 0);
    } else {
      const maxLvl = this.currentProgression?.nivelMagia || 0;
      return this.magiasList.filter(m => m.nivel >= 1 && m.nivel <= maxLvl);
    }
  }

  toggleTruque(id: number): void {
    const idx = this.selectedTruques.indexOf(id);
    if (idx > -1) {
      this.selectedTruques.splice(idx, 1);
    } else {
      const limit = this.currentProgression?.truquesConhecidos || 0;
      if (this.selectedTruques.length < limit) {
        this.selectedTruques.push(id);
      } else {
        this.showToast(`Você pode escolher no máximo ${limit} truques.`, 'error');
      }
    }
  }

  isTruqueSelected(id: number): boolean {
    return this.selectedTruques.includes(id);
  }

  toggleMagia(id: number): void {
    const idx = this.selectedMagias.indexOf(id);
    if (idx > -1) {
      this.selectedMagias.splice(idx, 1);
    } else {
      const limit = this.currentProgression?.magiasConhecidas || 0;
      if (this.selectedMagias.length < limit) {
        this.selectedMagias.push(id);
      } else {
        this.showToast(`Você pode escolher no máximo ${limit} magias.`, 'error');
      }
    }
  }

  isMagiaSelected(id: number): boolean {
    return this.selectedMagias.includes(id);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const commaIndex = base64String.indexOf(',');
        if (commaIndex !== -1) {
          this.base64Imagem = base64String.substring(commaIndex + 1);
        } else {
          this.base64Imagem = base64String;
        }
      };
      reader.readAsDataURL(file);
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

  // Wizard Navigation
  nextStep(): void {
    if (this.currentStep === 1) {
      if (!this.nome.trim()) {
        this.showToast('Por favor, preencha o nome do personagem.', 'error');
        return;
      }
      this.charService.checkNameExists(this.nome).subscribe(res => {
        if (res.exists) {
          this.showToast('Já existe um personagem com este nome na taverna!', 'error');
        } else {
          this.currentStep = 2;
        }
      });
    } else if (this.currentStep === 2) {
      if (!this.selectedRaceObj) {
        this.showToast('Por favor, selecione uma raça.', 'error');
        return;
      }
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      if (this.nivel < 1 || this.nivel > 20) {
        this.showToast('Nível deve ser entre 1 e 20.', 'error');
        return;
      }
      if (!this.selectedClassObj) {
        this.showToast('Por favor, selecione uma classe.', 'error');
        return;
      }
      
      // Validate subclass selection if required
      const subclassLvl = this.getSubclassLevel(this.selectedClassObj);
      if (this.nivel >= subclassLvl && this.selectedClassObj.subclasses && this.selectedClassObj.subclasses.length > 0) {
        if (!this.selectedSubclassObj) {
          this.showToast('Por favor, escolha uma subclasse no Nível ' + subclassLvl + '.', 'error');
          return;
        }
        if (this.selectedSubclassObj.nome.toLowerCase() === 'o gênio' || this.selectedSubclassObj.nome.toLowerCase() === 'o genio') {
          if (!this.subclasseEscolha) {
            this.showToast('Por favor, selecione o elemento/gênio patrono.', 'error');
            return;
          }
        }
      }

      // Validate skill selections
      const requiredPericias = this.selectedClassObj.qtdPericiasEscolha || 0;
      if (this.selectedPericias.length !== requiredPericias) {
        this.showToast(`Por favor, escolha exatamente ${requiredPericias} perícias da classe.`, 'error');
        return;
      }
      
      // Navigate conditionally based on spells presence
      if (this.hasSpells()) {
        this.currentStep = 4;
      } else {
        this.currentStep = 5;
      }
    } else if (this.currentStep === 4) {
      const requiredTruques = this.currentProgression?.truquesConhecidos || 0;
      const requiredMagias = this.currentProgression?.magiasConhecidas || 0;
      if (this.selectedTruques.length !== requiredTruques) {
        this.showToast(`Por favor, escolha exatamente ${requiredTruques} truques.`, 'error');
        return;
      }
      if (this.selectedMagias.length !== requiredMagias) {
        this.showToast(`Por favor, escolha exatamente ${requiredMagias} magias.`, 'error');
        return;
      }
      this.currentStep = 5;
    }
  }

  prevStep(): void {
    if (this.currentStep === 5) {
      if (this.hasSpells()) {
        this.currentStep = 4;
      } else {
        this.currentStep = 3;
      }
    } else if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    const finalRace = this.selectedRaceObj ? this.selectedRaceObj.nome : '';
    const finalClass = this.selectedClassObj ? this.selectedClassObj.nome : '';
    const finalSubclass = this.selectedSubclassObj ? this.selectedSubclassObj.nome : 'Geral';

    if (!this.nome.trim() || !this.codigo.trim() || !finalRace || !finalClass) {
      this.showToast('Por favor, garanta que todos os dados obrigatórios foram preenchidos.', 'error');
      return;
    }

    if (this.attributesGenerationMode !== 'manual') {
      if (this.attributes.strength === 0 || this.attributes.dexterity === 0 ||
          this.attributes.constitution === 0 || this.attributes.intelligence === 0 ||
          this.attributes.wisdom === 0 || this.attributes.charisma === 0) {
        this.showToast('Por favor, aloque todos os atributos arrastando os valores disponíveis.', 'error');
        return;
      }
    }

    const hp = this.finalHp;

    const dto = {
      nome: this.nome,
      codigo: this.codigo,
      base64Imagem: this.base64Imagem || null,
      raca: finalRace,
      classe: finalClass,
      subclasse: finalSubclass,
      nivel: this.nivel,
      alinhamento: this.alinhamento,
      forca: this.attributes.strength,
      destreza: this.attributes.dexterity,
      constituicao: this.attributes.constitution,
      inteligencia: this.attributes.intelligence,
      sabedoria: this.attributes.wisdom,
      carisma: this.attributes.charisma,
      vidaMaxima: hp,
      vidaAtual: hp,
      subclasseEscolha: (finalSubclass.toLowerCase() === 'o genio' || finalSubclass.toLowerCase() === 'o gênio') ? this.subclasseEscolha : null,
      periciasEscolhidas: this.selectedPericias,
      equipamentosEscolhidos: this.getSelectedEquipments(),
      magiasEscolhidas: this.hasSpells() ? [...this.selectedTruques, ...this.selectedMagias] : null
    };

    this.charService.createCharacter(dto).subscribe({
      next: () => {
        this.showToast('Lenda criada com sucesso! Redirecionando...', 'success');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        const msg = err.error?.message || 'Erro ao criar personagem.';
        this.showToast(msg, 'error');
      }
    });
  }
}

