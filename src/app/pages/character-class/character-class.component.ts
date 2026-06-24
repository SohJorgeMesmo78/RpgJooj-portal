import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CharacterService, Character } from '../../services/character.service';

@Component({
  selector: 'app-character-class',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-class.component.html',
  styleUrl: './character-class.component.scss'
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
    this.charService.getCharacterClasse(this.charId).subscribe(char => {
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

