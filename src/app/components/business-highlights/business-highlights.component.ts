import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-business-highlights',
  imports: [RouterLink, IconComponent],
  templateUrl: './business-highlights.component.html',
  styleUrl: './business-highlights.component.scss',
})
export class BusinessHighlightsComponent {
  highlights = [
    {
      icon: 'settings',
      title: 'How We Print',
      description: 'Fine-art paper & our print process—see the details.',
      cta: 'See our process',
      link: '/how-we-print',
      color: 'cyan',
    },
    {
      icon: 'rocket',
      title: 'Custom Print',
      description:
        'Upload your image, preview it, then we print it museum-quality.',
      cta: 'Create your print',
      link: '/your-design',
      color: 'violet',
    },
    {
      icon: 'users',
      title: 'Made in Den Bosch',
      description: 'Family-run studio. Personal support. No mystery sellers.',
      cta: 'Meet the family',
      link: '/about',
      color: 'cyan',
      image:
        'https://ecombone.blob.core.windows.net/ecommbone-catalog-product-image-uploads/1ca52204-114f-4786-b011-b020c9b61365',
    },
  ];
}
