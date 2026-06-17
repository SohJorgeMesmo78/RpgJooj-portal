import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-detail.component.html',
  styleUrl: './character-detail.component.scss'
})
export class CharacterDetailComponent implements OnInit, OnDestroy {
  character: Character | undefined;
  private routeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const charId = params['name']; // Using ':name' parameter mapping from routes
      if (charId) {
        this.characterService.getCharacterById(charId).subscribe(char => {
          if (char) {
            const modDex = Math.floor((char.sheet.attributes.dexterity - 10) / 2);
            char.sheet.ac = 10 + modDex;
            char.sheet.hp = char.sheet.vidaMaxima ?? 10;
          }
          this.character = char;
        });
      }
    });
  }

  getModifier(value: number): string {
    if (value === 0) return '-';
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
