import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CharacterService, Character, PericiaInfo } from '../../services/character.service';

export interface PericiaView {
  id: number;
  nome: string;
  modificadorAtributo: string;
  proficiente: boolean;
  maestria: boolean;
}

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="sheet-container animate-fade-in" *ngIf="character">
      <!-- Header de Navegação -->
      <div class="navigation-header">
        <a [routerLink]="['/', charId]" class="back-link">
          <span class="arrow">➔</span> Voltar para Detalhes
        </a>
        <div class="sheet-title-badge font-medieval">FICHA DE PERSONAGEM</div>
      </div>

      <!-- Cabeçalho Principal Compacto (Estilo Placa Metálica Horizontal) -->
      <header class="character-header medieval-border">
        <div class="header-left">
          <h1 class="character-name font-medieval">{{ character.name }}</h1>
        </div>
        <div class="header-right">
          <div class="character-meta-grid">
            <div class="meta-item">
              <span class="meta-label">Classe e Subclasse</span>
              <span class="meta-value">{{ character.classAndSubclass }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Raça</span>
              <span class="meta-value">{{ character.race }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Nível</span>
              <span class="meta-value font-medieval">{{ character.sheet.level }}</span>
            </div>
            <div class="meta-item" *ngIf="character.sheet.alignment">
              <span class="meta-label">Alinhamento</span>
              <span class="meta-value">{{ character.sheet.alignment }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Painel Principal de Combate & Vida (Compactado em 1 Linha) -->
      <section class="combat-panel-grid">
        <!-- CA Escudo -->
        <div class="combat-stat-box ca-box">
          <div class="shield-icon">
            <span class="stat-value font-medieval">{{ 10 + getModifier(character.sheet.attributes.dexterity) }}</span>
          </div>
          <span class="stat-label font-medieval">Armadura (CA)</span>
        </div>

        <!-- Iniciativa -->
        <div class="combat-stat-box initiative-box">
          <div class="stat-circle font-medieval">
            {{ formatModifier(getModifier(character.sheet.attributes.dexterity)) }}
          </div>
          <span class="stat-label font-medieval">Iniciativa</span>
        </div>

        <!-- Deslocamento -->
        <div class="combat-stat-box speed-box">
          <div class="stat-circle font-medieval">
            {{ getSpeed(character) }}m
          </div>
          <span class="stat-label font-medieval">Deslocamento</span>
        </div>

        <!-- Bônus de Proficiência -->
        <div class="combat-stat-box prof-bonus-box">
          <div class="stat-circle font-medieval">
            +{{ proficiencyBonus }}
          </div>
          <span class="stat-label font-medieval">Proficiência</span>
        </div>

        <!-- Pontos de Vida (HP) - Compactado e ao lado da Proficiência -->
        <div class="combat-stat-box hp-box font-medieval">
          <div class="hp-header">
            <span class="stat-label">Pontos de Vida</span>
            <div class="hp-values">
              <span class="current-hp">{{ currentHp + tempHp }}</span>
              <span class="separator">/</span>
              <span class="max-hp">{{ maxHp }}</span>
              <span class="temp-hp-parenthesis" *ngIf="tempHp > 0">({{ tempHp }})</span>
            </div>
          </div>
          <div class="hp-bar-container" [class.has-temp-hp]="tempHp > 0">
            <div class="hp-bar-fill" [style.width.%]="(currentHp / maxHp) * 100"></div>
          </div>
          <!-- HP Controls: Input e Botões de Dano/Cura -->
          <div class="hp-controls-wrapper">
            <input type="number" [(ngModel)]="hpInputVal" class="hp-number-input font-medieval" min="1" />
            <button (click)="applyDamage()" class="hp-action-btn damage-action-btn">Dano</button>
            <button (click)="applyHeal()" class="hp-action-btn heal-action-btn">Cura</button>
          </div>
        </div>
      </section>

      <!-- Atributos & Perícias -->
      <div class="attributes-skills-grid">
        
        <!-- Lado Esquerdo: Atributos Base -->
        <section class="attributes-section">
          <h2 class="section-title font-medieval">Atributos</h2>
          <div class="attributes-list">
            
            <!-- Força -->
            <div class="attribute-card">
              <span class="attr-name">FOR</span>
              <span class="attr-modifier font-medieval">
                {{ formatModifier(getModifier(character.sheet.attributes.strength)) }}
              </span>
              <div class="attr-value font-medieval">{{ character.sheet.attributes.strength }}</div>
            </div>

            <!-- Destreza -->
            <div class="attribute-card">
              <span class="attr-name">DES</span>
              <span class="attr-modifier font-medieval">
                {{ formatModifier(getModifier(character.sheet.attributes.dexterity)) }}
              </span>
              <div class="attr-value font-medieval">{{ character.sheet.attributes.dexterity }}</div>
            </div>

            <!-- Constituição -->
            <div class="attribute-card">
              <span class="attr-name">CON</span>
              <span class="attr-modifier font-medieval">
                {{ formatModifier(getModifier(character.sheet.attributes.constitution)) }}
              </span>
              <div class="attr-value font-medieval">{{ character.sheet.attributes.constitution }}</div>
            </div>

            <!-- Inteligência -->
            <div class="attribute-card">
              <span class="attr-name">INT</span>
              <span class="attr-modifier font-medieval">
                {{ formatModifier(getModifier(character.sheet.attributes.intelligence)) }}
              </span>
              <div class="attr-value font-medieval">{{ character.sheet.attributes.intelligence }}</div>
            </div>

            <!-- Sabedoria -->
            <div class="attribute-card">
              <span class="attr-name">SAB</span>
              <span class="attr-modifier font-medieval">
                {{ formatModifier(getModifier(character.sheet.attributes.wisdom)) }}
              </span>
              <div class="attr-value font-medieval">{{ character.sheet.attributes.wisdom }}</div>
            </div>

            <!-- Carisma -->
            <div class="attribute-card carisma-highlight">
              <span class="attr-name">CAR</span>
              <span class="attr-modifier font-medieval">
                {{ formatModifier(getModifier(character.sheet.attributes.charisma)) }}
              </span>
              <div class="attr-value font-medieval">{{ character.sheet.attributes.charisma }}</div>
            </div>

          </div>
        </section>

        <!-- Lado Direito: Perícias (Skills) -->
        <section class="skills-section">
          <div class="skills-section-header">
            <h2 class="section-title font-medieval">Perícias</h2>
            <span class="skills-info-hint">Clique na bolinha única para ciclar: Vazio ➔ Proficiente ➔ Maestria</span>
          </div>
          <div class="skills-card-container medieval-border">
            <div class="skills-list">
              <div class="skill-row" *ngFor="let skill of pericias">
                
                <!-- Bolinha Única de 3 Estados (Sem, P ou M) -->
                <div class="skill-checks-single">
                  <button 
                    [class.proficient]="skill.proficiente && !skill.maestria" 
                    [class.maestria]="skill.proficiente && skill.maestria" 
                    (click)="cycleProficiency(skill)" 
                    class="single-check-btn" 
                    [title]="getSkillTitle(skill)">
                  </button>
                </div>

                <!-- Modificador Final da Perícia -->
                <span class="skill-modifier font-medieval" [class.highlighted]="skill.proficiente">
                  {{ formatModifier(getSkillModifier(skill)) }}
                </span>

                <!-- Nome e Atributo -->
                <span class="skill-name">{{ skill.nome }}</span>
                <span class="skill-attr">({{ skill.modificadorAtributo.substring(0, 3) }})</span>

              </div>
            </div>
          </div>
        </section>

      </div>
    </div>

    <!-- Container de Loading -->
    <div class="loading-container font-medieval" *ngIf="!character">
      <div class="spinner"></div>
      Buscando registros na guilda de aventureiros...
    </div>
  `,
  styles: [`
    .sheet-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      color: var(--color-text);
    }

    .navigation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 170, 0, 0.15);
      padding-bottom: 10px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--color-primary);
      font-family: var(--font-medieval);
      text-decoration: none;
      font-size: 1.1rem;
      transition: var(--transition);
      cursor: pointer;
    }

    .back-link .arrow {
      display: inline-block;
      transform: rotate(180deg);
      transition: var(--transition);
    }

    .back-link:hover {
      color: #fff;
      text-shadow: 0 0 8px var(--color-primary);
    }

    .back-link:hover .arrow {
      transform: rotate(180deg) translateX(4px);
    }

    .sheet-title-badge {
      background: rgba(255, 170, 0, 0.1);
      border: 1px solid var(--color-primary);
      color: var(--color-primary);
      padding: 4px 16px;
      border-radius: 4px;
      font-size: 0.9rem;
      letter-spacing: 1.5px;
      text-shadow: 0 0 4px rgba(255, 170, 0, 0.3);
    }

    /* Header Compacto Placa Metálica */
    .character-header {
      background: linear-gradient(135deg, #1c1c22 0%, #121215 100%);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-left {
      flex: 1 1 250px;
    }

    .character-name {
      font-size: 2.3rem;
      color: var(--color-primary);
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6), 0 0 12px rgba(255, 170, 0, 0.25);
      letter-spacing: 1px;
    }

    .header-right {
      flex: 2 1 450px;
    }

    .character-meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 12px;
      justify-items: end;
    }

    @media (max-width: 768px) {
      .character-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .character-meta-grid {
        justify-items: start;
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: var(--color-text-muted);
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-size: 0.95rem;
      color: #fff;
      font-weight: 500;
    }

    /* Painel de Combate */
    .combat-panel-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr) 2.5fr;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .combat-panel-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .hp-box {
        grid-column: span 2;
      }
    }

    .combat-stat-box {
      background: rgba(24, 24, 28, 0.95);
      border: 1px solid rgba(255, 170, 0, 0.12);
      border-radius: var(--border-radius);
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      position: relative;
      transition: var(--transition);
    }

    .combat-stat-box:hover {
      border-color: rgba(255, 170, 0, 0.3);
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--color-text-muted);
      text-align: center;
      letter-spacing: 0.5px;
    }

    /* CA Escudo */
    .ca-box {
      padding: 8px 12px;
    }

    .shield-icon {
      width: 65px;
      height: 75px;
      background: radial-gradient(circle, #25252d 0%, #16161a 100%);
      border: 2px solid var(--color-primary);
      border-bottom-left-radius: 50% 80%;
      border-bottom-right-radius: 50% 80%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5), inset 0 0 8px rgba(255,170,0,0.2);
      position: relative;
    }

    .shield-icon::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 1px;
      background: rgba(255, 170, 0, 0.15);
    }

    .shield-icon .stat-value {
      font-size: 1.8rem;
      color: var(--color-primary);
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      z-index: 2;
    }

    /* Círculos de Combate */
    .stat-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: radial-gradient(circle, #22222a 0%, #121215 100%);
      border: 2px solid rgba(255, 170, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: #fff;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4), inset 0 0 6px rgba(0,0,0,0.8);
    }

    /* HP Box Compacto */
    .hp-box {
      align-items: stretch;
      justify-content: space-between;
      padding: 12px 16px;
    }

    .hp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .hp-values {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 1.3rem;
    }

    .current-hp {
      color: #ff4d4d;
      text-shadow: 0 0 6px rgba(255, 77, 77, 0.3);
      font-size: 1.5rem;
    }

    .separator {
      color: var(--color-text-muted);
    }

    .max-hp {
      color: #fff;
    }

    .temp-hp-parenthesis {
      color: #ffd700;
      font-size: 1.15rem;
      margin-left: 2px;
      text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
    }

    .hp-bar-container {
      height: 10px;
      background: #08080a;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 5px;
      overflow: hidden;
      margin: 4px 0;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
      position: relative;
    }

    .hp-bar-container.has-temp-hp {
      border: 1px solid #ffd700;
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
    }

    .hp-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #b30000 0%, #ff3333 100%);
      border-radius: 5px;
      transition: width 0.4s ease-out;
      box-shadow: 0 0 10px rgba(255,51,51,0.5);
    }

    /* HP Controls */
    .hp-controls-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }

    .hp-number-input {
      width: 55px;
      height: 28px;
      background: #08080a;
      border: 1px solid rgba(255, 170, 0, 0.4);
      border-radius: 4px;
      color: #fff;
      text-align: center;
      font-size: 0.95rem;
      outline: none;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
      transition: var(--transition);
    }

    .hp-number-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 8px rgba(255, 170, 0, 0.3);
    }

    /* Remove Spin Buttons no input */
    .hp-number-input::-webkit-outer-spin-button,
    .hp-number-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .hp-action-btn {
      flex: 1;
      height: 28px;
      background: transparent;
      border-radius: 4px;
      font-family: var(--font-medieval);
      font-size: 0.8rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .damage-action-btn {
      border: 1px solid #ff4d4d;
      color: #ff4d4d;
    }

    .damage-action-btn:hover {
      background: #ff4d4d;
      color: #fff;
      box-shadow: 0 0 8px rgba(255, 77, 77, 0.4);
    }

    .heal-action-btn {
      border: 1px solid #2ecc71;
      color: #2ecc71;
    }

    .heal-action-btn:hover {
      background: #2ecc71;
      color: #fff;
      box-shadow: 0 0 8px rgba(46, 204, 113, 0.4);
    }

    /* Layout Atributos e Perícias */
    .attributes-skills-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
    }

    @media (max-width: 850px) {
      .attributes-skills-grid {
        grid-template-columns: 1fr;
      }
    }

    .section-title {
      font-size: 1.5rem;
      color: var(--color-primary);
      margin: 0 0 14px 0;
      letter-spacing: 0.5px;
      border-left: 3px solid var(--color-primary);
      padding-left: 8px;
    }

    /* Lista de Atributos */
    .attributes-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .attribute-card {
      background: rgba(24, 24, 28, 0.95);
      border: 1px solid rgba(255, 170, 0, 0.15);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      transition: var(--transition);
      overflow: hidden;
    }

    .attribute-card::before {
      content: '';
      position: absolute;
      top: -3px;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 170, 0, 0.15);
    }

    .attribute-card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 6px 12px rgba(255, 170, 0, 0.08);
      transform: translateY(-1px);
    }

    .attribute-card.carisma-highlight {
      border-color: rgba(255, 170, 0, 0.45);
      box-shadow: 0 4px 10px rgba(255, 170, 0, 0.1);
    }

    .attribute-card.carisma-highlight::before {
      background: var(--color-primary);
      box-shadow: 0 0 6px var(--color-primary);
    }

    .attr-name {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      letter-spacing: 1px;
      font-weight: bold;
    }

    .attr-modifier {
      font-size: 2rem;
      color: #fff;
      margin: 4px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .attr-value {
      background: #111113;
      border: 1px solid rgba(255, 170, 0, 0.25);
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: var(--color-primary);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
    }

    /* Seção de Perícias */
    .skills-section {
      display: flex;
      flex-direction: column;
    }

    .skills-section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .skills-section-header .section-title {
      margin: 0;
    }

    .skills-info-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      font-style: italic;
    }

    .skills-card-container {
      background: linear-gradient(135deg, #1c1c22 0%, #121215 100%);
      padding: 16px 20px;
      flex: 1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }

    .skills-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 10px 20px;
    }

    .skill-row {
      display: flex;
      align-items: center;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255,255,255,0.02);
      font-size: 0.9rem;
    }

    .skill-row:hover {
      background: rgba(255,255,255,0.01);
    }

    .skill-checks-single {
      display: flex;
      margin-right: 12px;
    }

    /* Bolinha de 3 Estados */
    .single-check-btn {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255, 170, 0, 0.4);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.6);
    }

    .single-check-btn:hover {
      border-color: var(--color-primary);
      box-shadow: 0 0 6px rgba(255, 170, 0, 0.3);
    }

    .single-check-btn.proficient {
      background: var(--color-primary);
      border-color: var(--color-primary);
      box-shadow: 0 0 8px rgba(255, 170, 0, 0.4);
    }

    .single-check-btn.maestria {
      background: #ffd700;
      border-color: #ffd700;
      box-shadow: 0 0 14px #ffd700, inset 0 0 4px #fff;
      animation: maestria-shimmer 1.8s infinite alternate;
    }

    @keyframes maestria-shimmer {
      0% { filter: drop-shadow(0 0 2px #ffd700); transform: scale(1); }
      100% { filter: drop-shadow(0 0 10px #ffd700); transform: scale(1.1); }
    }

    .skill-modifier {
      width: 34px;
      color: var(--color-text-muted);
      font-size: 1rem;
      text-align: right;
      margin-right: 12px;
      display: inline-block;
    }

    .skill-modifier.highlighted {
      color: var(--color-primary);
      font-weight: bold;
      text-shadow: 0 0 5px rgba(255, 170, 0, 0.25);
    }

    .skill-name {
      color: #fff;
      flex: 1;
    }

    .skill-attr {
      color: var(--color-text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      margin-left: 4px;
    }

    /* Loading e Spinner */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 20px;
      gap: 20px;
      color: var(--color-primary);
      font-size: 1.2rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 170, 0, 0.15);
      border-radius: 50%;
      border-top-color: var(--color-primary);
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .medieval-border {
      border: 1px solid rgba(255, 170, 0, 0.18);
      border-radius: 4px;
      box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.6);
      position: relative;
    }

    .medieval-border::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      border: 1px solid rgba(255, 170, 0, 0.05);
      pointer-events: none;
    }
  `]
})
export class CharacterSheetComponent implements OnInit, OnDestroy {
  charId: string = '';
  character: Character | undefined;
  pericias: PericiaView[] = [];
  currentHp: number = 0;
  maxHp: number = 0;
  tempHp: number = 0;
  hpInputVal: number = 1;
  
  private routeSub: Subscription | undefined;

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
    // 1. Primeiro carrega todas as perícias oficiais da API
    this.charService.getPericias().subscribe(periciasDb => {
      this.pericias = periciasDb.map(p => ({
        id: p.id,
        nome: p.nome,
        modificadorAtributo: p.modificadorAtributo,
        proficiente: false,
        maestria: false
      }));

      // 2. Depois carrega o personagem pelo ID/código
      this.charService.getCharacterById(this.charId).subscribe(char => {
        if (char) {
          this.character = char;
          // Utiliza a vida máxima e atual que vêm do banco persistido
          this.maxHp = char.sheet.vidaMaxima ?? 10;
          this.currentHp = char.sheet.vidaAtual ?? this.maxHp;
          this.tempHp = 0; // Inicializa vida temporária local
        }
      });
    });
  }

  getModifier(value: number): number {
    return Math.floor((value - 10) / 2);
  }

  formatModifier(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
  }

  getSpeed(character: Character): number {
    if (character.classes && character.classes.length > 0) {
      return character.classes[0].deslocamento;
    }
    return 9; // Fallback
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
      case 'forca': return attrs.strength;
      case 'destreza': return attrs.dexterity;
      case 'constituicao': return attrs.constitution;
      case 'inteligencia': return attrs.intelligence;
      case 'sabedoria': return attrs.wisdom;
      case 'carisma': return attrs.charisma;
      default: return 10;
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
}
