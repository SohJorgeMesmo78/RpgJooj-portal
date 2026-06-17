import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  characters$: Observable<Character[]> | undefined;

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {
    this.characters$ = this.characterService.getCharacters();
  }
}
