import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CategoryCard {
  title: string;
  image: string;
  link: string;
}

@Component({
  selector: 'app-section-hero-plain',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-hero-plain.component.html',
  styleUrls: ['./section-hero-plain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeroPlainComponent {
  className = input<string>('');
  subHeading = input<string>(
    'Shop Stunning Prints & Frames for Your Home Decor.',
  );
  heading = input<string>('Affordable High-Quality Art Prints');
  btnText = input<string>('Buy Now');
  btnLink = input<string>('/search');
  categories = input<CategoryCard[]>([
    {
      title: 'Museum Art Prints',
      image:
        'https://genstorageaccount3116.blob.core.windows.net/printme-processed-images/bc6ca6b1-d98a-421a-8627-4d7c4296e04a/bc6ca6b1-d98a-421a-8627-4d7c4296e04a-mockup1.jpeg',
      link: '/search?category=museum-art',
    },
    {
      title: 'Your Custom Design',
      image:
        'https://genstorageaccount3116.blob.core.windows.net/printme-processed-images/bc6ca6b1-d98a-421a-8627-4d7c4296e04a/bc6ca6b1-d98a-421a-8627-4d7c4296e04a-mockup1.jpeg',
      link: '/search?category=custom-design',
    },
    {
      title: 'Best Sellers',
      image:
        'https://genstorageaccount3116.blob.core.windows.net/printme-processed-images/bc6ca6b1-d98a-421a-8627-4d7c4296e04a/bc6ca6b1-d98a-421a-8627-4d7c4296e04a-mockup1.jpeg',
      link: '/search?category=best-sellers',
    },
  ]);
}
