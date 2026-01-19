import { Component, input, ChangeDetectionStrategy } from '@angular/core';

import { IconComponent } from '../shared/icon/icon.component';

export interface CategoryCard {
  title: string;
  image: string;
  link: string;
}

@Component({
  selector: 'app-section-hero-plain',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './section-hero-plain.component.html',
  styleUrls: ['./section-hero-plain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeroPlainComponent {
  categories: CategoryCard[] = [
    {
      title: 'Museum Art Prints',
      image:
        'https://ecombone.blob.core.windows.net/ecomm-processed-images/localhost/1764/1764-small.jpeg',
      link: '/search?categoryName=Art Prints',
    },
    {
      title: 'Your Custom Design',
      image:
        'https://ecombone.blob.core.windows.net/ecommbone-catalog-product-image-uploads/df5279ac-e160-45b2-939a-dfc86cb757a7',
      link: '/your-design',
    },
    {
      title: 'Best Sellers',
      image:
        'https://ecombone.blob.core.windows.net/ecommbone-catalog-product-image-uploads/df54a144-71f9-47ea-b8f0-a3136d6301db',
      link: '/products',
    },
  ];
}
