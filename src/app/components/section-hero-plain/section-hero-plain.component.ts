import { RouterLink } from '@angular/router';
import { LinkPipe } from '../../shared/link.pipe';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { IconComponent } from '../shared/icon/icon.component';

export interface CategoryCard {
  title: string;
  image: string;
  link: string;
}

@Component({
  selector: 'app-section-hero-plain',
  standalone: true,
  imports: [RouterLink, LinkPipe, TranslatePipe, IconComponent],
  templateUrl: './section-hero-plain.component.html',
  styleUrls: ['./section-hero-plain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeroPlainComponent {
  categories: CategoryCard[] = [
    {
      title: 'home.cardMuseum',
      image:
        'https://ecombone.blob.core.windows.net/ecomm-processed-images/localhost/1764/1764-small.jpeg',
      link: '/products?categoryName=Art Prints',
    },
    {
      title: 'home.cardCustom',
      image:
        'https://genstorageaccount3116.blob.core.windows.net/printme-images/home-card-custom.webp',
      link: '/your-design',
    },
    {
      title: 'home.cardBestSellers',
      image:
        'https://genstorageaccount3116.blob.core.windows.net/printme-images/home-card-bestsellers.webp',
      link: '/products',
    },
  ];
}
