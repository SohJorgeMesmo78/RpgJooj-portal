import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CharacterService, Character } from '../../services/character.service';

@Component({
  selector: 'app-character-class',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="class-page-container animate-fade-in" *ngIf="character">
      <!-- Header de Navegação -->
      <div class="navigation-header">
        <a [routerLink]="['/', charId]" class="back-link">
          <span class="arrow">➔</span> Voltar para Detalhes
        </a>
        <div class="page-title-badge font-medieval">INFORMAÇÕES DE CLASSE</div>
      </div>

      <div *ngFor="let classe of character?.classes" class="class-section">
        <!-- Banner da Classe -->
        <header class="class-banner medieval-border">
          <div class="banner-left">
            <span class="banner-category font-medieval">Classe & Subclasse</span>
            <h1 class="class-name font-medieval">
              {{ classe.nome }}
              <span class="subclass-name" *ngIf="classe.subclasse">({{ classe.subclasse }})</span>
            </h1>
            <span class="class-level-badge font-medieval">Nível {{ classe.nivel }}</span>
          </div>

          <div class="banner-right">
            <div class="hit-die-container">
              <div class="dice-shape font-medieval" title="Dado de Vida">
                <span class="dice-label">Dado Vida</span>
                <span class="dice-value">{{ classe.dadoVida }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Painel de Status de Progresso -->
        <section class="progression-section" *ngIf="classe.progresso">
          <h2 class="section-title font-medieval">Estatísticas do Nível Atual</h2>
          <div class="stats-grid">
            <div class="stat-badge-card medieval-border">
              <span class="stat-label">Bônus de Proficiência</span>
              <span class="stat-value font-medieval">+{{ classe.progresso.bonusProficiencia }}</span>
            </div>
            <div class="stat-badge-card medieval-border">
              <span class="stat-label">Truques Conhecidos</span>
              <span class="stat-value font-medieval">{{ classe.progresso.truquesConhecidos }}</span>
            </div>
            <div class="stat-badge-card medieval-border">
              <span class="stat-label">Magias Conhecidas</span>
              <span class="stat-value font-medieval">{{ classe.progresso.magiasConhecidas }}</span>
            </div>
            <div class="stat-badge-card medieval-border">
              <span class="stat-label">Espaços de Magia</span>
              <span class="stat-value font-medieval">{{ classe.progresso.espacosMagia }}</span>
            </div>
            <div class="stat-badge-card medieval-border">
              <span class="stat-label">Nível de Magia</span>
              <span class="stat-value font-medieval">{{ formatMagicLevel(classe.progresso.nivelMagia) }}</span>
            </div>
            <div class="stat-badge-card medieval-border">
              <span class="stat-label">Invocações Conhecidas</span>
              <span class="stat-value font-medieval">{{ classe.progresso.invocacoesConhecidas }}</span>
            </div>
          </div>
        </section>

        <!-- Características Desbloqueadas (Timeline) -->
        <section class="features-section">
          <h2 class="section-title font-medieval">Características de Classe Desbloqueadas</h2>

          <div class="timeline" *ngIf="classe.caracteristicas && classe.caracteristicas.length > 0">
            <div class="timeline-item animate-fade-in" *ngFor="let feat of classe.caracteristicas">
              <div class="timeline-node font-medieval">Lvl {{ feat.nivel }}</div>
              <div class="timeline-content medieval-border">
                <h3 class="feature-title font-medieval">
                  {{ feat.nome }}
                  <span class="feature-level-indicator">Adquirido no Nível {{ feat.nivel }}</span>
                </h3>
                <p class="feature-desc">{{ feat.descricao }}</p>
              </div>
            </div>
          </div>

          <div class="no-features-card medieval-border" *ngIf="!classe.caracteristicas || classe.caracteristicas.length === 0">
            Nenhuma característica de classe registrada até o momento.
          </div>
        </section>
      </div>
    </div>

    <!-- Container de Loading -->
    <div class="loading-container font-medieval" *ngIf="!character">
      <div class="spinner"></div>
      Folheando grimórios em busca dos registros de treinamento...
    </div>
  `,
  styles: [`
    .class-page-container {
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
    .class-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .class-banner {
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
    .class-name {
      font-size: 2.2rem;
      color: var(--color-primary);
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 12px rgba(255, 170, 0, 0.25);
    }
    .subclass-name {
      font-size: 1.5rem;
      color: #dfdfe5;
      font-weight: 300;
      margin-left: 8px;
    }
    .class-level-badge {
      display: inline-block;
      margin-top: 8px;
      font-size: 0.95rem;
      color: #fff;
      background: rgba(255, 170, 0, 0.15);
      border: 1px solid rgba(255, 170, 0, 0.4);
      padding: 2px 10px;
      border-radius: 4px;
    }
    .hit-die-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dice-shape {
      background: radial-gradient(circle, #25252f 0%, #17171d 100%);
      border: 2.5px solid var(--color-primary);
      width: 72px;
      height: 72px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 0 8px rgba(255, 170, 0, 0.2);
      transform: rotate(45deg);
      transition: all 0.3s ease;
    }
    .dice-shape:hover {
      transform: rotate(45deg) scale(1.05);
      box-shadow: 0 6px 15px rgba(255, 170, 0, 0.15), inset 0 0 12px rgba(255, 170, 0, 0.3);
    }
    .dice-label {
      transform: rotate(-45deg);
      font-size: 0.55rem;
      text-transform: uppercase;
      color: var(--color-text-muted);
      letter-spacing: 0.5px;
      margin-top: -4px;
    }
    .dice-value {
      transform: rotate(-45deg);
      font-size: 1.4rem;
      color: #fff;
      font-weight: bold;
      text-shadow: 0 0 6px rgba(255, 170, 0, 0.5);
    }
    .section-title {
      font-size: 1.5rem;
      color: var(--color-primary);
      margin: 0 0 16px 0;
      border-left: 3px solid var(--color-primary);
      padding-left: 10px;
      letter-spacing: 0.5px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 16px;
    }
    .stat-badge-card {
      background: rgba(24, 24, 28, 0.95);
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-align: center;
      transition: all 0.3s ease;
      min-height: 90px;
    }
    .stat-badge-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 170, 0, 0.08);
    }
    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--color-text-muted);
      letter-spacing: 0.5px;
      line-height: 1.3;
    }
    .stat-value {
      font-size: 1.5rem;
      color: var(--color-primary);
      font-weight: bold;
      text-shadow: 0 0 8px rgba(255, 170, 0, 0.2);
    }
    .timeline {
      position: relative;
      padding-left: 30px;
      margin-left: 10px;
      border-left: 2px solid rgba(255, 170, 0, 0.15);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .timeline-item {
      position: relative;
    }
    .timeline-node {
      position: absolute;
      left: -48px;
      top: 14px;
      background: #17171d;
      border: 1px solid var(--color-primary);
      color: var(--color-primary);
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.6);
      z-index: 2;
    }
    .timeline-content {
      background: rgba(20, 20, 24, 0.95);
      padding: 20px 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      transition: all 0.3s ease;
    }
    .timeline-content:hover {
      border-color: var(--color-primary);
      box-shadow: 0 6px 18px rgba(255, 170, 0, 0.08);
    }
    .feature-title {
      font-size: 1.25rem;
      color: var(--color-primary);
      margin: 0 0 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .feature-level-indicator {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: normal;
    }
    .feature-desc {
      font-size: 0.95rem;
      line-height: 1.6;
      color: #dfdfe5;
      margin: 0;
      white-space: pre-line;
    }
    .no-features-card {
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
    @media (max-width: 600px) {
      .class-banner {
        flex-direction: column;
        align-items: flex-start;
      }
      .hit-die-container {
        align-self: flex-end;
      }
      .timeline {
        padding-left: 20px;
        margin-left: 0;
      }
      .timeline-node {
        left: -35px;
        font-size: 0.7rem;
      }
      .feature-title {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class CharacterClassComponent implements OnInit, OnDestroy {
  charId: string = '';
  character: Character | undefined;
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

  formatMagicLevel(nivel: number): string {
    if (!nivel) return '—';
    return `${nivel}º`;
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}

