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
  showLargeImage = input(false);
  fromPrice = this.apiService.FromPrice;
  isHorizontal = computed(() => {
    return this.product().imageRatio >= 1;
  });

  firstImage = computed(() => {
    return this.showLargeImage() ? this.product().image.large || this.product().image.medium || this.product().image.small : this.product().image.medium || this.product().image.small;
  });
  secondImage = computed(() => {
    return this.showLargeImage()
      ? this.product().secondImage.large || this.product().secondImage.medium || this.product().secondImage.small
      : this.product().secondImage.medium || this.product().secondImage.small;
  });
  thirdImage = computed(() => {
    return this.showLargeImage()
      ? this.product().thirdImage.large || this.product().thirdImage.medium || this.product().thirdImage.small
      : this.product().thirdImage.medium || this.product().thirdImage.small;
  });

  constructor(private router: Router) {}

  goToProduct() {
    const productId = this.product()?.id;
    if (productId) {
      this.router.navigate(['/products', productId]);
    }
  }
}
