import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItemDto } from '../../models/cart-item';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly BASKET_API_URL = environment.serviceUrls['basket-api'];

  constructor(
    private _httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  get isSSR(): boolean {
    return this.platformId == 'server' ? true : false;
  }

  addProductToCart(cartItem: CartItemDto): Observable<CartItemDto> {
    return this._httpClient.post<CartItemDto>(
      `${this.BASKET_API_URL}/basket/v1/basket/upsert-item`,
      cartItem
    );
  }

  getCartItems(): Observable<CartItemDto[]> {
    if (this.isSSR) {
      return of([]);
    }
    return this._httpClient.get<CartItemDto[]>(
      `${this.BASKET_API_URL}/basket/v1/basket`
    );
  }
}
