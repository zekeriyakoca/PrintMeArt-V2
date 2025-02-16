import { Component } from '@angular/core';
import { BaseAppComponent } from '../baseAppComponent';

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent extends BaseAppComponent {
  constructor() {
    super();
  }
}
