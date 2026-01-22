import { CustomerCart } from './../../models/cart-item';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
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

  // Track if cart has been synced after login
  private cartSyncedAfterLogin = false;

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

  /**
   * Sync cart after user login.
   * Fetches the user's backend cart, merges with local cart items, then syncs back.
   * Should be called immediately after successful authentication.
   */
  syncCartAfterLogin(): Observable<CartItemDto[]> {
    this.cartSyncedAfterLogin = true;
    const localCart = [...this.cart()];

    this.telemetry.trackEvent('cart_sync_after_login', {
      localItemCount: localCart.length,
    });

    // First, fetch the user's existing cart from backend
    return this._httpClient
      .get<CartItemDto[]>(`${this.BASKET_API_URL}/basket/v1/basket`)
      .pipe(
        switchMap((backendCart) => {
          // Merge local cart with backend cart
          const mergedCart = this.mergeCartItems(backendCart, localCart);

          this.telemetry.trackEvent('cart_merge_result', {
            backendItemCount: backendCart.length,
            localItemCount: localCart.length,
            mergedItemCount: mergedCart.length,
          });

          // If merged cart differs from backend, sync it back
          if (mergedCart.length > 0 && localCart.length > 0) {
            return this.updateCartOnBackend(mergedCart).pipe(
              tap((syncedCart) => {
                console.log(
                  'Cart merged and synced after login:',
                  syncedCart.length,
                  'items',
                );
              }),
            );
          }

          // No local items to merge, just use backend cart
          this.cart.set(backendCart);
          console.log('Cart fetched after login:', backendCart.length, 'items');
          return of(backendCart);
        }),
      );
  }

  /**
   * Merge backend cart with local cart items.
   * If an item exists in both (same variantId + options), increase quantity.
   * Otherwise, add the item from local cart.
   */
  private mergeCartItems(
    backendCart: CartItemDto[],
    localCart: CartItemDto[],
  ): CartItemDto[] {
    const merged = [...backendCart];

    for (const localItem of localCart) {
      const existingIndex = merged.findIndex(
        (item) =>
          item.variantId === localItem.variantId &&
          this.summaryOptions(item.selectedOptions) ===
            this.summaryOptions(localItem.selectedOptions),
      );

      if (existingIndex >= 0) {
        // Item exists in backend cart, increase quantity
        merged[existingIndex] = {
          ...merged[existingIndex],
          quantity: merged[existingIndex].quantity + localItem.quantity,
        };
      } else {
        // Item doesn't exist in backend cart, add it
        merged.push(localItem);
      }
    }

    return merged;
  }

  /**
   * Reset the cart sync flag (call on logout)
   */
  resetCartSyncState(): void {
    this.cartSyncedAfterLogin = false;
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
