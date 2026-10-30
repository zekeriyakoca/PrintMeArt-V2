import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, input } from '@angular/core';
import { ProductSimpleDto } from '../../models/product';
import { RouterLink } from '@angular/router';
import { productPath } from '../../shared/product-path';

@Component({
  selector: 'app-product-card',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<ProductSimpleDto>();
  fromPrice = computed(() => this.product().cheapestPrice);
  isHorizontal = computed(() => {
    return this.product().imageRatio >= 1;
  });

  readonly productPath = productPath;
}
