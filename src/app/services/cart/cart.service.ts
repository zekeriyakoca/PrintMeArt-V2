import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CartItemDto, SelectedOptionDto } from '../../models/cart-item';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AnalyticsService } from '../telemetry/analytics.service';

/** Options whose value is an image that gets printed */
const PRINTED_IMAGE_OPTIONS = ['CustomProductUrl', 'PreviewSnapshotUrl'];

/** The most of one item the basket accepts */
const MAX_QUANTITY = 100;

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly BASKET_URL = `${environment.serviceUrls['basket-api']}/basket/v1/basket`;
  cart = signal<CartItemDto[]>([]);

  // Cart notification state
  showCartNotification = signal<boolean>(false);
  lastAddedItem = signal<CartItemDto | null>(null);

  // Cart sidebar state
  isCartSidebarOpen = signal<boolean>(false);

  constructor(
    private _httpClient: HttpClient,
    private analytics: AnalyticsService,
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

  // Every change below asks the basket API for that one change and shows the basket it answers with.
  // The browser never sends its own copy of the basket, so a tab that is behind cannot bring back
  // what another tab removed.

  addItemToCart(productId: number, variantId: number, productName: string, calculatedPrice: number, quantity: number, pictureUrl: string, selectedOptions: SelectedOptionDto[]): void {
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

    // The basket API decides whether this joins a line that is already there; this is only what analytics reports
    const mergedIntoExisting = this.cart().some(
      (c) => c.productId == newItem.productId && c.variantId == newItem.variantId && this.summaryOptions(c.selectedOptions) === this.summaryOptions(newItem.selectedOptions),
    );

    this.analytics.trackAddToCart({
      productId,
      variantId,
      productName,
      quantity,
      unitPrice: calculatedPrice,
      mergedIntoExisting,
      selectedOptionsCount: selectedOptions?.length ?? 0,
    });

    // Show cart notification
    this.lastAddedItem.set(newItem);
    this.showCartNotification.set(true);

    this.save(this._httpClient.post<CartItemDto[]>(`${this.BASKET_URL}/items`, newItem));
  }

  private summaryOptions(selectedOptionDto: SelectedOptionDto[]): string {
    return selectedOptionDto
      // The uploaded image and the saved design are part of what gets printed: different ones are different lines
      .map((o) => (PRINTED_IMAGE_OPTIONS.includes(o.optionName ?? '') ? `${o.optionName}:${o.spec1}` : `${o.optionName}:${o.name}`))
      .sort()
      .join('_');
  }

  /** The + and - buttons. Going below one removes the item. */
  changeQuantity(item: CartItemDto, change: number): void {
    const quantity = item.quantity + change;
    if (quantity < 1) {
      this.removeItemFromCart(item.id);
      return;
    }
    if (quantity > MAX_QUANTITY) return;

    this.analytics.trackCartQuantityChanged(item, change);

    // Shown right away, so a second click counts from the new quantity
    this.cart.update((items) => items.map((i) => (i.id === item.id ? { ...i, quantity } : i)));
    this.save(this._httpClient.put<CartItemDto[]>(`${this.BASKET_URL}/items/${encodeURIComponent(item.id)}/quantity`, { quantity }));
  }

  removeItemFromCart(itemId: string): void {
    this.analytics.trackRemoveFromCart(this.cart().find((x) => x.id === itemId));

    this.cart.update((items) => items.filter((item) => item.id !== itemId));
    this.save(this._httpClient.delete<CartItemDto[]>(`${this.BASKET_URL}/items/${encodeURIComponent(itemId)}`));
  }

  /**
   * Clear the entire cart (used after successful payment)
   */
  clearCart(): void {
    this.cart.set([]);

    if (!this.isSSR) {
      this.save(this._httpClient.delete<CartItemDto[]>(this.BASKET_URL));
    }
  }

  fetchCartItems(): void {
    if (this.isSSR) return;

    this._httpClient.get<CartItemDto[]>(this.BASKET_URL).subscribe((cartItems) => this.cart.set(cartItems));
  }

  /**
   * Re-reads the basket and shows the given prices on it. Checkout calls this with the prices the
   * order will charge, which may not have reached the basket itself.
   */
  reloadWithPrices(prices: { id: string; unitPrice: number }[]): Observable<CartItemDto[]> {
    const priceById = new Map(prices.map((p) => [p.id, p.unitPrice]));
    return this._httpClient
      .get<CartItemDto[]>(this.BASKET_URL)
      .pipe(tap((items) => this.cart.set(items.map((item) => ({ ...item, unitPrice: priceById.get(item.id) ?? item.unitPrice })))));
  }

  /** Shows the basket the API answered with; when the change failed, shows the basket as it really is */
  private save(change: Observable<CartItemDto[]>): void {
    change.subscribe({
      next: (cartItems) => this.cart.set(cartItems),
      error: (error) => {
        console.error('The basket could not be changed:', error);
        this.fetchCartItems();
      },
    });
  }
}
