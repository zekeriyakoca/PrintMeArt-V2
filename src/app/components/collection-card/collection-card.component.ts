import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryDto } from '../../models/category';
import { IconComponent } from '../shared/icon/icon.component';
import { LanguageService } from '../../services/i18n/language.service';
import { categoryLink } from '../../shared/category-path';

@Component({
  selector: 'app-collection-card',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.scss',
})
export class CollectionCardComponent {
  category = input.required<CategoryDto>();

  private readonly language = inject(LanguageService).currentLanguageCode();

  constructor(private router: Router) {}

  goToCategory() {
    const categoryName = this.category()?.name;
    if (categoryName) {
      this.router.navigateByUrl(categoryLink(this.language, categoryName));
    }
  }
}
