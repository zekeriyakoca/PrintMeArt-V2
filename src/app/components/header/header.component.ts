import { Component, signal } from '@angular/core';
import { BaseAppComponent } from '../baseAppComponent';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent extends BaseAppComponent {
  totalItemCountInCart = signal<number>(0);
  activeDropdown: string | null = null;
  isMobileMenuOpen = signal<boolean>(false);
  constructor(
    private router: Router,
    private cartService: CartService,
  ) {
    super();
    toObservable(this.cartService.cart)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((cart) => {
        this.totalItemCountInCart.set(cart.length);
      });
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }
  toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('open');
    }
  }
  showDropdown(dropdown: string) {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
    console.log(this.activeDropdown);
  }
  hideDropdown(dropdown: string) {
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
      console.log(this.activeDropdown);
    }
  }
}
