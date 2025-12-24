import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  widgetMenus = [
    {
      id: '1',
      title: 'Company',
      menus: [
        { href: '/about', label: 'About us' },
        { href: '/about', label: 'Contact' },
        { href: '/how-we-print', label: 'How we print' },
      ],
    },
    {
      id: '2',
      title: 'Legal',
      menus: [
        { href: '/legal#shipping', label: 'Shipping' },
        { href: '/legal#returns', label: 'Returns & refunds' },
        { href: '/legal#terms', label: 'Terms of service' },
        { href: '/legal#privacy', label: 'Privacy policy' },
      ],
    },
    {
      id: '3',
      title: 'Licensing',
      menus: [
        { href: '/licensing#credits', label: 'Licensing & credits' },
        { href: '/licensing#report', label: 'Report an issue' },
      ],
    },
    {
      id: '4',
      title: 'Shop',
      menus: [
        { href: '/search', label: 'All prints' },
        { href: '/frames', label: 'Frames' },
        { href: '/your-design', label: 'Your design' },
      ],
    },
  ];
}
