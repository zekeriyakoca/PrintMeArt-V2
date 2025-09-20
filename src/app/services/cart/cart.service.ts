import { CustomerCart } from './../../models/cart-item';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { first, map, Observable, tap } from 'rxjs';
import { CartItemDto, SelectedOptionDto } from '../../models/cart-item';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly BASKET_API_URL = environment.serviceUrls['basket-api'];
  cart = signal<CartItemDto[]>([]);

  constructor(
    private _httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {}

  get isSSR(): boolean {
    return this.platformId === 'server';
  }

  addItemToCart(
    productId: number,
    variantId: number,
    productName: string,
    cheapestPrice: number,
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

    if (existingItemIndex >= 0) {
      this.cart()[existingItemIndex].quantity += newItem.quantity;
    } else {
      this.cart().push(newItem);
    }

    this.updateCartOnBackend(this.cart())
      .pipe(first())
      .subscribe({
        next: () => console.log('Product added to cart successfully'),
        error: (error) => console.error('Error adding product to cart:', error),
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
      .pipe(first())
      .subscribe((cartItems) => this.cart.set(cartItems));
  }

  removeItemFromCart(itemId: any): void {
    const updatedCart = this.cart().filter((item) => item.id !== itemId);

    this.cart.set(updatedCart);

    this.updateCartOnBackend(updatedCart)
      .pipe(first())
      .subscribe({
        next: () => console.log('Product removed from cart successfully'),
        error: (error) =>
          console.error('Error removing product from cart:', error),
      });
  }
}
