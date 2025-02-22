import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collection-card',
  imports: [],
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.scss',
})
export class CollectionCardComponent {
  @Input() category: string = '';

  constructor(private router: Router) {}

  goToCategory() {
    this.router.navigate(['/products', this.category.toLowerCase()]);
  }
}
