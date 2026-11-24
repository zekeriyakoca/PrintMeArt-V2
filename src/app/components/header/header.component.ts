import { RouterLink } from '@angular/router';
import { LinkPipe } from '../../shared/link.pipe';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { ApiService } from './../../services/api/api.service';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { ScrollLockService } from '../../services/scroll-lock/scroll-lock.service';
import { LanguageService } from '../../services/i18n/language.service';
import { BaseAppComponent } from '../baseAppComponent';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart/cart.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { takeUntil } from 'rxjs';
import { CategoryDto } from '../../models/category';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { IconComponent } from '../shared/icon/icon.component';
import { LanguageDropdownComponent } from '../language-dropdown/language-dropdown.component';
import { artistPath } from '../../shared/artist-path';

@Component({
  selector: 'app-header',
  imports: [RouterLink, LinkPipe, TranslatePipe, UserMenuComponent, IconComponent, LanguageDropdownComponent],
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

  isWideCategory(category: CategoryDto): boolean {
    return (category.childCategories?.length ?? 0) > 5;
  }

  private readonly lang = inject(LanguageService).currentLanguageCode();
  readonly artistsIndex = artistPath(this.lang);

  readonly collectionGroups = [
    {
      name: 'nav.picks',
      href: '/collections#picks',
      items: [
        { name: 'nav.editorsPicks', href: '/products?tags=8' },
        { name: 'nav.spotlight', href: '/products?tags=2' },
        { name: 'nav.classics', href: '/products?attributeName=Classics' },
        { name: 'nav.dutchMasters', href: '/products?categoryName=Dutch%20Masters' },
        { name: 'nav.vanGogh', href: artistPath(this.lang, 'vincent-van-gogh') },
      ],
    },
    {
      name: 'nav.museums',
      href: '/collections#museums',
      items: [
        { name: 'Rijksmuseum', href: '/products?attributeName=Rijksmuseum' },
        { name: 'The Met', href: '/products?attributeName=Metropolitan%20Museum%20of%20Art' },
        { name: 'Art Institute of Chicago', href: '/products?attributeName=Art%20Institute%20of%20Chicago' },
        { name: 'National Gallery of Art', href: '/products?attributeName=National%20Gallery%20of%20Art' },
        { name: 'Birmingham Museums', href: '/products?attributeName=Birmingham%20Museums%20Trust' },
        { name: 'Cleveland Museum of Art', href: '/products?attributeName=Cleveland%20Museum%20of%20Art' },
        { name: 'Te Papa', href: '/products?attributeName=Museum%20of%20New%20Zealand%20Te%20Papa%20Tongarewa' },
      ],
    },
    {
      name: 'nav.masters',
      href: artistPath(this.lang),
      items: [
        { name: 'Claude Monet', href: artistPath(this.lang, 'claude-monet') },
        { name: 'Vincent van Gogh', href: artistPath(this.lang, 'vincent-van-gogh') },
        { name: 'Camille Pissarro', href: artistPath(this.lang, 'camille-pissarro') },
        { name: 'Alfred Sisley', href: artistPath(this.lang, 'alfred-sisley') },
        { name: 'Pierre-Auguste Renoir', href: artistPath(this.lang, 'pierre-auguste-renoir') },
        { name: 'J.M.W. Turner', href: artistPath(this.lang, 'j-m-w-turner') },
        { name: 'John Singer Sargent', href: '/products?attributeName=John%20Singer%20Sargent' },
      ],
    },
    {
      name: 'nav.styles',
      href: '/collections#styles',
      items: [
        { name: 'Renaissance', href: '/products?attributeName=Renaissance' },
        { name: 'nav.romanticism', href: '/products?attributeName=Romanticism' },
        { name: 'nav.impressionism', href: '/products?attributeName=Impressionism' },
        { name: 'nav.postImpressionism', href: '/products?attributeName=Post-Impressionism' },
        { name: 'nav.realism', href: '/products?attributeName=Realism' },
        { name: 'Art Nouveau', href: '/products?attributeName=Art%20Nouveau' },
      ],
    },
  ];

  readonly languageService = inject(LanguageService);

  // The page behind stays still while the mobile menu is open
  private readonly scrollLock = inject(ScrollLockService);
  private readonly menuScrollLock = effect(() => {
    if (this.isMobileMenuOpen()) this.scrollLock.lock(this);
    else this.scrollLock.unlock(this);
  });
  private readonly releaseOnDestroy = inject(DestroyRef).onDestroy(() => this.scrollLock.unlock(this));

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
    this.router.navigate(['/products'], { fragment: 'search' });
  }

  navigateToCart() {
    this.cartService.openCartSidebar();
  }
  toggleMobileMenu() {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
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
