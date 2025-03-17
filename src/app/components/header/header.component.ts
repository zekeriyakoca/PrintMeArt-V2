import { Component } from '@angular/core';
import { BaseAppComponent } from '../baseAppComponent';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent extends BaseAppComponent {
  constructor(private router: Router) {
    super();
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }
}
