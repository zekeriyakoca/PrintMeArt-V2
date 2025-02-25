import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryDto } from '../../models/category';

@Component({
  selector: 'app-collection-card',
  imports: [],
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.scss',
})
export class CollectionCardComponent {
  category = input.required<CategoryDto>();

  constructor(private router: Router) {}

  goToCategory() {
    const categoryId = this.category()?.id;
    if (categoryId) {
      this.router.navigate(['/products'], { queryParams: { categoryId } });
    }
  }
}
