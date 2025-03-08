import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { first, Observable } from 'rxjs';
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
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  get isSSR(): boolean {
    return this.platformId === 'server';
  }

  addItemToCart(
    productId: number,
    productName: string,
    cheapestPrice: number,
    calculatedPrice: number,
    pictureUrl: string,
    selectedOptions: SelectedOptionDto[]
  ): void {
    const newItem: CartItemDto = {
      id: crypto.randomUUID(),
      productId,
      variantId: 1,
      selectedOptions,
      unitPrice: cheapestPrice,
      quantity: 1,
      noDiscountUnitPrice: calculatedPrice,
      productName,
      pictureUrl,
    };

    const updatedCart = [...this.cart(), newItem];
    this.cart.set(updatedCart);

    this.updateCartOnBackend(updatedCart)
      .pipe(first())
      .subscribe({
        next: () => console.log('Product added to cart successfully'),
        error: (error) => console.error('Error adding product to cart:', error),
      });
  }

  updateCartOnBackend(cartItems: CartItemDto[]): Observable<CartItemDto[]> {
    return this._httpClient.put<CartItemDto[]>(
      `${this.BASKET_API_URL}/basket/v1/basket`,
      cartItems
    );
  }

  fetchCartItems(): void {
    if (this.isSSR) return;

    this._httpClient
      .get<CartItemDto[]>(`${this.BASKET_API_URL}/basket/v1/basket`)
      .pipe(first())
      .subscribe((cartItems) => this.cart.set(cartItems));
  }
}
