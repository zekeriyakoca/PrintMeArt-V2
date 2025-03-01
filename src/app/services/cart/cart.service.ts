import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItemDto } from '../../models/cart-item';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly BASKET_API_URL = environment.serviceUrls['basket-api'];

  constructor(private _httpClient: HttpClient) {}

  addProductToCart(cartItem: CartItemDto): Observable<CartItemDto> {
    return this._httpClient.post<CartItemDto>(
      `${this.BASKET_API_URL}/basket/v1/basket/upsert-item`,
      cartItem
    );
  }
}
