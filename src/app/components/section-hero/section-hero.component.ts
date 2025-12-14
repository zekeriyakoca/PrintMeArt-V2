import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-section-hero',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './section-hero.component.html',
  styleUrls: ['./section-hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeroComponent {
  className = input<string>('');
  subHeading = input<string>(
    'Shop Stunning Prints & Frames for Your Home Decor.',
  );
  heading = input<string>('Affordable High-Quality Art Prints');
  btnText = input<string>('Buy Now');
  btnLink = input<string>('/search');
  image = input<string>(
    'https://genstorageaccount3116.blob.core.windows.net/printme-images/main-slider-6.webp',
  );
  backgroundImage = input<string>('/assets/Moon.svg');
}
