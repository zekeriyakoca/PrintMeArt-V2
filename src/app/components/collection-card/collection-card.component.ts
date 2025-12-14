import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryDto } from '../../models/category';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-collection-card',
  imports: [IconComponent],
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.scss',
})
export class CollectionCardComponent {
  category = input.required<CategoryDto>();

  constructor(private router: Router) {}

  goToCategory() {
    const categoryName = this.category()?.name;
    if (categoryName) {
      this.router.navigate(['/products'], { queryParams: { categoryName } });
    }
  }
}
