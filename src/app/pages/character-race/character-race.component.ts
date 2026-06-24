import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CharacterService, Character } from '../../services/character.service';

@Component({
  selector: 'app-character-race',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="race-page-container animate-fade-in" *ngIf="character">
      <!-- Header de Navegação -->
      <div class="navigation-header">
        <a [routerLink]="['/', charId]" class="back-link">
          <span class="arrow">➔</span> Voltar para Detalhes
        </a>
        <div class="page-title-badge font-medieval">INFORMAÇÕES DE RAÇA</div>
      </div>

      <!-- Placa de Identificação da Raça (Visual Premium) -->
      <header class="race-banner medieval-border">
        <div class="banner-left">
          <span class="banner-category font-medieval">Raça do Personagem</span>
          <h1 class="race-name font-medieval">{{ character?.racaInfo?.nome || character?.race }}</h1>
        </div>
        <div class="banner-right">
          <div class="race-meta-grid">
            <div class="meta-item">
              <span class="meta-label">Tipo de Criatura</span>
              <span class="meta-value" [title]="character?.racaInfo?.tipoCriatura || ''">
                {{ character?.racaInfo?.tipoCriatura ? (character?.racaInfo?.tipoCriatura?.split('.')?.[0]) : 'Humanóide' }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Tamanho</span>
              <span class="meta-value">{{ character?.racaInfo?.tamanho || 'Médio' }}</span>
            </div>
            <div class="meta-item clickable-speed" (click)="toggleSpeedUnit()" title="Clique para alternar metros/pés">
              <span class="meta-label">Deslocamento</span>
              <span class="meta-value font-medieval">
                {{ getSpeedDisplay() }}
                <span class="unit-toggle-hint">({{ exibirEmFeet ? 'ft' : 'm' }})</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Descrição da Lore -->
      <section class="lore-section medieval-border" *ngIf="character?.racaInfo?.descricao">
        <h2 class="section-title font-medieval">História & Fisiologia</h2>
        <p class="lore-text">{{ character?.racaInfo?.descricao }}</p>
      </section>

      <!-- Traços e Habilidades -->
      <section class="traits-section">
        <h2 class="section-title font-medieval">Habilidades & Traços Raciais</h2>
        <div class="traits-grid">
          <div class="trait-card medieval-border animate-fade-in" *ngFor="let trait of character?.tracosRaciais">
            <div class="trait-header">
              <span class="trait-icon">✦</span>
              <h3 class="trait-name font-medieval">{{ trait.nome }}</h3>
            </div>
            <div class="trait-body">
              <p class="trait-desc">{{ trait.descricao }}</p>
            </div>
          </div>
          <div class="no-traits-card medieval-border" *ngIf="!character?.tracosRaciais || character?.tracosRaciais?.length === 0">
            Nenhum traço racial registrado no grimório.
          </div>
        </div>
      </section>
    </div>

    <!-- Container de Loading -->
    <div class="loading-container font-medieval" *ngIf="!character">
      <div class="spinner"></div>
      Consultando o conselho de anciãos sobre a linhagem...
    </div>
  `,
  styles: [`
    .race-page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
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
    .page-title-badge {
      background: rgba(255, 170, 0, 0.1);
      border: 1px solid var(--color-primary);
      color: var(--color-primary);
      padding: 4px 16px;
      border-radius: 4px;
      font-size: 0.9rem;
      letter-spacing: 1.5px;
      text-shadow: 0 0 4px rgba(255, 170, 0, 0.3);
    }
    .race-banner {
      background: linear-gradient(135deg, #1c1c22 0%, #121215 100%);
      padding: 20px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .banner-category {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--color-text-muted);
      letter-spacing: 1.5px;
      display: block;
      margin-bottom: 4px;
    }
    .race-name {
      font-size: 2.5rem;
      color: var(--color-primary);
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 12px rgba(255, 170, 0, 0.25);
    }
    .race-meta-grid {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .clickable-speed {
      cursor: pointer;
      transition: var(--transition);
    }
    .clickable-speed:hover .meta-value {
      color: var(--color-primary);
      text-shadow: 0 0 8px rgba(255, 170, 0, 0.4);
    }
    .meta-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: var(--color-text-muted);
      letter-spacing: 0.5px;
    }
    .meta-value {
      font-size: 1.1rem;
      color: #fff;
      font-weight: 500;
    }
    .unit-toggle-hint {
      font-size: 0.75rem;
      color: var(--color-primary);
      margin-left: 2px;
    }
    .lore-section {
      background: rgba(20, 20, 24, 0.95);
      padding: 24px 28px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
    .section-title {
      font-size: 1.5rem;
      color: var(--color-primary);
      margin: 0 0 16px 0;
      border-left: 3px solid var(--color-primary);
      padding-left: 10px;
      letter-spacing: 0.5px;
    }
    .lore-text {
      font-size: 1.05rem;
      line-height: 1.7;
      color: #dfdfe5;
      font-style: italic;
      margin: 0;
      white-space: pre-line;
    }
    .traits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 16px;
    }
    @media (max-width: 768px) {
      .traits-grid {
        grid-template-columns: 1fr;
      }
      .race-banner {
        flex-direction: column;
        align-items: flex-start;
      }
      .race-meta-grid {
        gap: 16px;
      }
    }
    .trait-card {
      background: rgba(24, 24, 28, 0.95);
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .trait-card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 6px 16px rgba(255, 170, 0, 0.08);
      transform: translateY(-2px);
    }
    .trait-header {
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255, 170, 0, 0.1);
      padding-bottom: 8px;
    }
    .trait-icon {
      color: var(--color-primary);
      font-size: 1.2rem;
    }
    .trait-name {
      font-size: 1.25rem;
      color: var(--color-primary);
      margin: 0;
    }
    .trait-desc {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--color-text-muted);
      margin: 0;
      white-space: pre-line;
    }
    .no-traits-card {
      grid-column: 1 / -1;
      padding: 24px;
      text-align: center;
      color: var(--color-text-muted);
      background: rgba(24, 24, 28, 0.5);
    }
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
export class CharacterRaceComponent implements OnInit, OnDestroy {
  charId: string = '';
  character: Character | undefined;
  exibirEmFeet: boolean = false;
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
    this.charService.getCharacterById(this.charId).subscribe(char => {
      if (char) {
        this.character = char;
      }
    });
  }

  toggleSpeedUnit(): void {
    this.exibirEmFeet = !this.exibirEmFeet;
  }

  getSpeedDisplay(): string {
    if (!this.character || !this.character.racaInfo) return '9m';
    const metros = this.character.racaInfo.deslocamento;
    if (this.exibirEmFeet) {
      const feet = Math.round((metros / 1.5) * 5);
      return `${feet} ft`;
    }
    return `${metros}m`;
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
