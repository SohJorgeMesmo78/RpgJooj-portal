import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CharacterService, Character, Chapter } from '../../services/character.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-character-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-history.component.html',
  styleUrl: './character-history.component.scss'
})
export class CharacterHistoryComponent implements OnInit, OnDestroy {
  character: Character | undefined;
  activeChapterIndex = 0;
  private routeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const charName = params['name'];
      if (charName) {
        this.characterService.getCharacterHistoria(charName).subscribe(char => {
          this.character = char;
          this.activeChapterIndex = 0;
        });
      }
    });
  }

  selectChapter(index: number): void {
    this.activeChapterIndex = index;
  }

  get activeChapter(): Chapter | null {
    if (this.character && this.character.chapters && this.character.chapters.length > 0) {
      return this.character.chapters[this.activeChapterIndex];
    }
    return null;
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
