import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, input } from '@angular/core';
import { ProductSimpleDto } from '../../models/product';
import { RouterLink } from '@angular/router';
import { productPath } from '../../shared/product-path';

@Component({
  selector: 'app-product-gallery-card',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './product-gallery-card.component.html',
  styleUrl: './product-gallery-card.component.scss',
})
export class ProductGalleryCardComponent {
  product = input.required<ProductSimpleDto>();
  showLargeImage = input(false);
  fromPrice = computed(() => this.product().cheapestPrice);
  // Reserves the card's height before its image loads, so the gallery columns don't reshuffle as images arrive
  aspectRatio = computed(() => {
    const ratio = this.product().imageRatio;
    return ratio > 0 ? `${ratio}` : null;
  });

  firstImage = computed(() => {
    return this.showLargeImage() ? this.product().image.large || this.product().image.medium || this.product().image.small : this.product().image.medium || this.product().image.small;
  });
  secondImage = computed(() => {
    return this.showLargeImage()
      ? this.product().secondImage.large || this.product().secondImage.medium || this.product().secondImage.small
      : this.product().secondImage.medium || this.product().secondImage.small;
  });

  readonly productPath = productPath;
}
