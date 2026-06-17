import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-character-class',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wip-page-container animate-fade-in">
      <div class="screen-wip-banner">
        <span class="wip-badge-mini">WIP</span> Seção em Desenvolvimento.
      </div>

      <div class="navigation-header">
        <a [routerLink]="['/', charId]" class="back-link">
          <span class="arrow">➔</span> Voltar para a Ficha
        </a>
      </div>

      <div class="wip-card medieval-card">
        <div class="wip-badge">WIP</div>
        <div class="wip-icon">🛡️</div>
        <h1>Classe e Subclasse</h1>
        <div class="card-divider"></div>
        <p class="wip-text">
          As habilidades de classe, feitiços conhecidos/preparados, espaços de magia e talentos do arquétipo estão sob catalogação técnica.
        </p>
        <div class="card-wip-notice">
          <span class="wip-badge-mini">Em construção</span> Aguardando integração do banco.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wip-page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .screen-wip-banner {
      background: rgba(18, 18, 20, 0.85);
      border: 1px solid rgba(255, 170, 0, 0.15);
      border-left: 4px solid var(--color-primary);
      color: var(--color-text-muted);
      padding: 12px 20px;
      border-radius: var(--border-radius);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 12px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    .navigation-header {
      display: flex;
      align-items: center;
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
    .wip-card {
      padding: 60px 40px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 25px;
      position: relative;
    }
    .wip-icon {
      font-size: 4rem;
      animation: icon-pulse 2.5s ease-in-out infinite;
    }
    h1 {
      font-size: 2.5rem;
      color: var(--color-primary);
    }
    .wip-text {
      color: var(--color-text-muted);
      font-size: 1.1rem;
      max-width: 500px;
      line-height: 1.7;
    }
    .card-divider {
      height: 2px;
      background: linear-gradient(90deg, transparent 10%, var(--color-primary) 50%, transparent 90%);
      width: 80%;
    }
    .card-wip-notice {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }
    @keyframes icon-pulse {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255,170,0,0.1)); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 15px rgba(255,170,0,0.4)); }
    }
  `]
})
export class CharacterClassComponent implements OnInit, OnDestroy {
  charId: string = '';
  private routeSub: Subscription | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.charId = params['name'] || '';
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
