import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-character-bonds',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-bonds.component.html',
  styleUrl: './character-bonds.component.scss'
})
export class CharacterBondsComponent implements OnInit, OnDestroy {
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
