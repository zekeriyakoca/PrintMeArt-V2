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
      title: 'Navigation',
      menus: [
        { href: '/search', label: 'Prints' },
        { href: '/our-services', label: 'Frames' },
        { href: '/about', label: 'About Us' },
        { href: '/search?tags=1', label: 'Bestsellers' },
      ],
    },
    {
      id: '2',
      title: 'Nature & Landscapes',
      menus: [
        { href: '/search?categoryName=nature-prints', label: 'Nature prints' },
        { href: '/search?categoryName=botanical-art', label: 'Botanical art' },
        { href: '/search?categoryName=animal-art', label: 'Animal art' },
        {
          href: '/search?categoryName=space-and-astronomy',
          label: 'Space and astronomy',
        },
        {
          href: '/search?categoryName=maps-and-cities',
          label: 'Maps and cities',
        },
        { href: '/search?categoryName=landscapes', label: 'Landscapes' },
      ],
    },
    {
      id: '3',
      title: 'Famous Painters',
      menus: [
        { href: '/search?categoryName=art-prints', label: 'Art prints' },
        {
          href: '/search?categoryName=renaissance-masters',
          label: 'Renaissance Masters',
        },
        { href: '/search?categoryName=dutch-masters', label: 'Dutch masters' },
        {
          href: '/search?categoryName=modern-masters',
          label: 'Modern masters',
        },
        { href: '/search?categoryName=abstract-art', label: 'Abstract art' },
      ],
    },
    {
      id: '4',
      title: 'Posters',
      menus: [
        {
          href: '/search?categoryName=retro-and-vintage',
          label: 'Retro and vintage',
        },
        {
          href: '/search?categoryName=black-and-white',
          label: 'Black and white',
        },
        {
          href: '/search?categoryName=historical-posters',
          label: 'Historical posters',
        },
        {
          href: '/search?categoryName=classic-posters',
          label: 'Classic posters',
        },
        { href: '/search?categoryName=text-posters', label: 'Text posters' },
        {
          href: '/search?categoryName=movies-and-games-posters',
          label: 'Movies & Games posters',
        },
        { href: '/search?categoryName=music-posters', label: 'Music posters' },
        {
          href: '/search?categoryName=sports-posters',
          label: 'Sports posters',
        },
      ],
    },
  ];
}
