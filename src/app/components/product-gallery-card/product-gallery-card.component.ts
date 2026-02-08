import { Component, computed, inject, input } from '@angular/core';
import { ProductSimpleDto } from '../../models/product';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-product-gallery-card',
  imports: [],
  templateUrl: './product-gallery-card.component.html',
  styleUrl: './product-gallery-card.component.scss',
})
export class ProductGalleryCardComponent {
  private apiService = inject(ApiService);

  product = input.required<ProductSimpleDto>();
  fromPrice = this.apiService.FromPrice;
  isHorizontal = computed(() => {
    return this.product().imageRatio >= 1;
  });

  constructor(private router: Router) {}

  goToProduct() {
    const productId = this.product()?.id;
    if (productId) {
      this.router.navigate(['/products', productId]);
    }
  }
}
