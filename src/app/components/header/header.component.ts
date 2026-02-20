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

  readonly collectionGroups = [
    {
      name: "Picks & Featured",
      href: '/collections#picks',
      items: [
        { name: "Editor's Picks", href: '/products?tags=8' },
        { name: 'In the Spotlight', href: '/products?tags=2' },
        { name: 'Timeless Classics', href: '/products?attributeName=Classics' },
        { name: 'Dutch Masters', href: '/products?categoryName=Dutch%20Masters' },
        { name: 'Van Gogh Collection', href: '/products?attributeName=Vincent%20van%20Gogh' },
      ],
    },
    {
      name: 'Museums',
      href: '/collections#museums',
      items: [
        { name: 'Rijksmuseum', href: '/products?attributeName=Rijksmuseum' },
        { name: 'The Met', href: '/products?attributeName=Metropolitan%20Museum%20of%20Art' },
        { name: 'National Gallery', href: '/products?attributeName=National%20Gallery%2C%20London' },
        { name: 'Cleveland Museum of Art', href: '/products?attributeName=Cleveland%20Museum%20of%20Art' },
        { name: 'Clark Art Institute', href: '/products?attributeName=Clark%20Art%20Institute' },
        { name: "Musée d'Orsay", href: "/products?attributeName=Mus%C3%A9e%20d'Orsay" },
        { name: 'Yale Art Gallery', href: '/products?attributeName=Yale%20University%20Art%20Gallery' },
      ],
    },
    {
      name: 'The Masters',
      href: '/collections#painters',
      items: [
        { name: 'Claude Monet', href: '/products?attributeName=Claude%20Monet' },
        { name: 'Vincent van Gogh', href: '/products?attributeName=Vincent%20van%20Gogh' },
        { name: 'Camille Pissarro', href: '/products?attributeName=Camille%20Pissarro' },
        { name: 'Alfred Sisley', href: '/products?attributeName=Alfred%20Sisley' },
        { name: 'Pierre-Auguste Renoir', href: '/products?attributeName=Pierre-Auguste%20Renoir' },
        { name: 'J.M.W. Turner', href: '/products?attributeName=J.%20M.%20W.%20Turner' },
        { name: 'John Singer Sargent', href: '/products?attributeName=John%20Singer%20Sargent' },
      ],
    },
    {
      name: 'Styles & Periods',
      href: '/collections#styles',
      items: [
        { name: 'Renaissance', href: '/products?attributeName=Renaissance' },
        { name: 'Romanticism', href: '/products?attributeName=Romanticism' },
        { name: 'Impressionism', href: '/products?attributeName=Impressionism' },
        { name: 'Post-Impressionism', href: '/products?attributeName=Post-Impressionism' },
        { name: 'Realism', href: '/products?attributeName=Realism' },
        { name: 'Art Nouveau', href: '/products?attributeName=Art%20Nouveau' },
      ],
    },
  ];

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
    this.isMobileMenuOpen.update((v) => !v);
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

  navigateToProductListPage() {
    this.router.navigate(['/products']);
  }
}
