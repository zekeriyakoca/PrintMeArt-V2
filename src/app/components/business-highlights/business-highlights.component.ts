import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-business-highlights',
  imports: [TranslatePipe, RouterLink, IconComponent],
  templateUrl: './business-highlights.component.html',
  styleUrl: './business-highlights.component.scss',
})
export class BusinessHighlightsComponent {
  highlights = [
    {
      icon: 'settings',
      title: 'highlights.printTitle',
      description: 'highlights.printText',
      cta: 'highlights.printCta',
      link: '/how-we-work',
      color: 'cyan',
    },
    {
      icon: 'rocket',
      title: 'highlights.customTitle',
      description: 'highlights.customText',
      cta: 'highlights.customCta',
      link: '/your-design',
      color: 'violet',
    },
    {
      icon: 'users',
      title: 'highlights.familyTitle',
      description: 'highlights.familyText',
      cta: 'highlights.familyCta',
      link: '/about',
      color: 'cyan',
      image:
        'https://genstorageaccount3116.blob.core.windows.net/printme-images/home-made-in-den-bosch.webp',
    },
  ];
}
