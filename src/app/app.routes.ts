import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { CharacterHistoryComponent } from './pages/character-history/character-history.component';
import { CharacterSheetComponent } from './pages/character-sheet/character-sheet.component';
import { CharacterBondsComponent } from './pages/character-bonds/character-bonds.component';
import { CharacterRaceComponent } from './pages/character-race/character-race.component';
import { CharacterClassComponent } from './pages/character-class/character-class.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: ':name', component: CharacterDetailComponent },
  { path: ':name/historia', component: CharacterHistoryComponent },
  { path: ':name/ficha', component: CharacterSheetComponent },
  { path: ':name/lacos', component: CharacterBondsComponent },
  { path: ':name/raca', component: CharacterRaceComponent },
  { path: ':name/classe', component: CharacterClassComponent },
  { path: '**', redirectTo: '' }
];

