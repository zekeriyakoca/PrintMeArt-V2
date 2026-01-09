import { Component } from '@angular/core';

import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [IconComponent],
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
        { href: '/how-we-work', label: 'How we work' },
      ],
    },
    {
      id: '2',
      title: 'Legal',
      menus: [
        { href: '/legal#shipping', label: 'Shipping' },
        { href: '/legal#returns', label: 'Returns' },
        { href: '/legal#terms', label: 'Terms' },
        { href: '/legal#complaints', label: 'Complaints' },
        { href: '/legal#privacy', label: 'Privacy' },
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
