import { CustomerCart } from './../../models/cart-item';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { CartItemDto, SelectedOptionDto } from '../../models/cart-item';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppInsightsService } from '../telemetry/app-insights.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly BASKET_API_URL = environment.serviceUrls['basket-api'];
  cart = signal<CartItemDto[]>([]);

  // Cart notification state
  showCartNotification = signal<boolean>(false);
  lastAddedItem = signal<CartItemDto | null>(null);

  // Cart sidebar state
  isCartSidebarOpen = signal<boolean>(false);

  constructor(
    private _httpClient: HttpClient,
    private telemetry: AppInsightsService,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {}

  get isSSR(): boolean {
    return this.platformId === 'server';
  }

  hideCartNotification(): void {
    this.showCartNotification.set(false);
  }

  openCartSidebar(): void {
    this.isCartSidebarOpen.set(true);
  }

  closeCartSidebar(): void {
    this.isCartSidebarOpen.set(false);
  }

  toggleCartSidebar(): void {
    this.isCartSidebarOpen.update((open) => !open);
  }

  addItemToCart(
    productId: number,
    variantId: number,
    productName: string,
    calculatedPrice: number,
    quantity: number,
    pictureUrl: string,
    selectedOptions: SelectedOptionDto[],
  ): void {
    const newItem: CartItemDto = {
      id: crypto.randomUUID(),
      productId,
      variantId,
      selectedOptions,
      unitPrice: calculatedPrice,
      quantity,
      noDiscountUnitPrice: calculatedPrice,
      productName,
      pictureUrl,
    };

    const existingItemIndex = this.cart().findIndex(
      (c) =>
        c.variantId == newItem.variantId &&
        this.summaryOptions(c.selectedOptions) ===
          this.summaryOptions(newItem.selectedOptions),
    );

    this.telemetry.trackEvent('cart_add_item', {
      productId,
      variantId,
      quantity,
      unitPrice: calculatedPrice,
      mergedIntoExisting: existingItemIndex >= 0,
      selectedOptionsCount: selectedOptions?.length ?? 0,
    });

    if (existingItemIndex >= 0) {
      this.cart()[existingItemIndex].quantity += newItem.quantity;
    } else {
      this.cart().push(newItem);
    }

    // Show cart notification
    this.lastAddedItem.set(newItem);
    this.showCartNotification.set(true);

    this.updateCartOnBackend(this.cart()).subscribe({
      next: () => console.log('Product added to cart successfully'),
      error: (error) => {
        this.telemetry.trackException(error, {
          operation: 'updateCartOnBackend',
          action: 'addItemToCart',
        });
        console.error('Error adding product to cart:', error);
      },
    });
  }

  private summaryOptions(selectedOptionDto: SelectedOptionDto[]): string {
    return selectedOptionDto
      .map((o) => o.optionName)
      .sort()
      .join('_');
  }

  updateCartOnBackend(cartItems: CartItemDto[]): Observable<CartItemDto[]> {
    return this._httpClient
      .put<CustomerCart>(`${this.BASKET_API_URL}/basket/v1/basket`, cartItems)
      .pipe(
        map((customerCart: CustomerCart) => customerCart.items),
        tap((cartItems) => this.cart.set(cartItems)),
      );
  }

  fetchCartItems(): void {
    if (this.isSSR) return;

    this._httpClient
      .get<CartItemDto[]>(`${this.BASKET_API_URL}/basket/v1/basket`)
      .subscribe((cartItems) => this.cart.set(cartItems));
  }

  removeItemFromCart(itemId: any): void {
    const item = this.cart().find((x) => x.id === itemId);
    const updatedCart = this.cart().filter((item) => item.id !== itemId);

    this.telemetry.trackEvent('cart_remove_item', {
      productId: item?.productId,
      variantId: item?.variantId,
      quantity: item?.quantity,
      unitPrice: item?.unitPrice,
    });

    this.cart.set(updatedCart);

    this.updateCartOnBackend(updatedCart).subscribe({
      next: () => console.log('Product removed from cart successfully'),
      error: (error) => {
        this.telemetry.trackException(error, {
          operation: 'updateCartOnBackend',
          action: 'removeItemFromCart',
        });
        console.error('Error removing product from cart:', error);
      },
    });
  }

  /**
   * Clear the entire cart (used after successful payment)
   */
  clearCart(): void {
    this.telemetry.trackEvent('cart_clear', {
      itemCount: this.cart().length,
    });

    this.cart.set([]);

    if (!this.isSSR) {
      this.updateCartOnBackend([]).subscribe({
        next: () => console.log('Cart cleared successfully'),
        error: (error) => {
          this.telemetry.trackException(error, {
            operation: 'updateCartOnBackend',
            action: 'clearCart',
          });
          console.error('Error clearing cart:', error);
        },
      });
    }
  }
}
