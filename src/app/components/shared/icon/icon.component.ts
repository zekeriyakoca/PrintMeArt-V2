import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    style:
      'display: inline-flex; align-items: center; justify-content: center;',
  },
})
export class IconComponent {
  iconName = input('');
}
