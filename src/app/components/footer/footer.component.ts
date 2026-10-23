import { RouterLink } from '@angular/router';
import { LinkPipe } from '../../shared/link.pipe';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component } from '@angular/core';

import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LinkPipe, TranslatePipe, IconComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  widgetMenus = [
    {
      id: '1',
      title: 'footer.company',
      menus: [
        { href: '/about', label: 'footer.aboutUs' },
        { href: '/about', label: 'footer.contact' },
        { href: '/how-we-work', label: 'footer.howWeWork' },
      ],
    },
    {
      id: '2',
      title: 'footer.legal',
      menus: [
        { href: '/legal#shipping', label: 'footer.shipping' },
        { href: '/legal#returns', label: 'footer.returns' },
        { href: '/legal#terms', label: 'footer.terms' },
        { href: '/legal#complaints', label: 'footer.complaints' },
        { href: '/legal#privacy', label: 'footer.privacy' },
      ],
    },
    {
      id: '3',
      title: 'footer.licensing',
      menus: [
        { href: '/licensing#credits', label: 'footer.credits' },
        { href: '/licensing#report', label: 'footer.report' },
      ],
    },
    {
      id: '4',
      title: 'footer.shop',
      menus: [
        { href: '/search', label: 'footer.allPrints' },
        { href: '/frames', label: 'footer.frames' },
        { href: '/your-design', label: 'footer.yourDesign' },
      ],
    },
  ];
}
