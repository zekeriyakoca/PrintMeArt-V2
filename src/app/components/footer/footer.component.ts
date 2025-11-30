import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
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
        { href: '/search?category=nature-prints', label: 'Nature prints' },
        { href: '/search?category=botanical-art', label: 'Botanical art' },
        { href: '/search?category=animal-art', label: 'Animal art' },
        {
          href: '/search?category=space-and-astronomy',
          label: 'Space and astronomy',
        },
        { href: '/search?category=maps-and-cities', label: 'Maps and cities' },
        { href: '/search?category=landscapes', label: 'Landscapes' },
      ],
    },
    {
      id: '3',
      title: 'Famous Painters',
      menus: [
        { href: '/search?category=art-prints', label: 'Art prints' },
        {
          href: '/search?category=renaissance-masters',
          label: 'Renaissance Masters',
        },
        { href: '/search?category=dutch-masters', label: 'Dutch masters' },
        { href: '/search?category=modern-masters', label: 'Modern masters' },
        { href: '/search?category=abstract-art', label: 'Abstract art' },
      ],
    },
    {
      id: '4',
      title: 'Posters',
      menus: [
        {
          href: '/search?category=retro-and-vintage',
          label: 'Retro and vintage',
        },
        { href: '/search?category=black-and-white', label: 'Black and white' },
        {
          href: '/search?category=historical-posters',
          label: 'Historical posters',
        },
        { href: '/search?category=classic-posters', label: 'Classic posters' },
        { href: '/search?category=text-posters', label: 'Text posters' },
        {
          href: '/search?category=movies-and-games-posters',
          label: 'Movies & Games posters',
        },
        { href: '/search?category=music-posters', label: 'Music posters' },
        { href: '/search?category=sports-posters', label: 'Sports posters' },
      ],
    },
  ];
}
