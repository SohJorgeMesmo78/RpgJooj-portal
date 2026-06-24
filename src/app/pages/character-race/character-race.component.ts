import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CharacterService, Character } from '../../services/character.service';

@Component({
  selector: 'app-character-race',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-race.component.html',
  styleUrl: './character-race.component.scss'
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
    this.charService.getCharacterRaca(this.charId).subscribe(char => {
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
