import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, inject, input } from '@angular/core';
import { ProductSimpleDto } from '../../models/product';
import { RouterLink } from '@angular/router';
import { productPath } from '../../shared/product-path';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-product-card',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  private apiService = inject(ApiService);

  product = input.required<ProductSimpleDto>();
  fromPrice = this.apiService.FromPrice;
  isHorizontal = computed(() => {
    return this.product().imageRatio >= 1;
  });

  readonly productPath = productPath;
}
