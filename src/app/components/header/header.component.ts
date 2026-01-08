import { ApiService } from './../../services/api/api.service';
import { Component, computed, signal } from '@angular/core';
import { BaseAppComponent } from '../baseAppComponent';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { takeUntil } from 'rxjs';
import { CategoryDto } from '../../models/category';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { IconComponent } from '../shared/icon/icon.component';
import { LanguageDropdownComponent } from '../language-dropdown/language-dropdown.component';

@Component({
  selector: 'app-header',
  imports: [UserMenuComponent, IconComponent, LanguageDropdownComponent],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent extends BaseAppComponent {
  totalItemCountInCart = signal<number>(0);
  activeDropdown: string | null = null;
  isMobileMenuOpen = signal<boolean>(false);
  categories = signal<CategoryDto[]>([]);

  // Get the "Prints" parent category's child categories for the mega menu
  printCategories = computed(() => {
    const prints = this.categories().find((c) => c.slug === 'prints');
    return prints?.childCategories ?? [];
  });

  constructor(
    private router: Router,
    private cartService: CartService,
    private apiService: ApiService,
  ) {
    super();
    toObservable(this.cartService.cart)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((cart) => {
        this.totalItemCountInCart.set(cart.length);
      });
    this.apiService.getCategories().subscribe((cats) => {
      this.categories.set(cats || []);
    });
  }

  navigateToSearch() {
    this.router.navigate(['/search'], { fragment: 'search' });
  }

  navigateToCart() {
    this.cartService.openCartSidebar();
  }
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMobileMenuOpen() ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
    document.body.style.overflow = '';
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

  encodeURIComponent(value: string): string {
    return encodeURIComponent(value);
  }
}
