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
    // return of([
    //   {
    //     id: '6ebb1df7-3beb-4f21-bbbb-e3b35849f5a0',
    //     productId: 2,
    //     variantId: 1,
    //     selectedOptions: [
    //       {
    //         optionId: 13,
    //       },
    //       {
    //         optionId: 11,
    //       },
    //     ],
    //     unitPrice: 0,
    //     quantity: 1,
    //     noDiscountUnitPrice: 31.5,
    //     productName: 'T-Shirt',
    //     pictureUrl:
    //       'https://ecombone.blob.core.windows.net/ecommbone-catalog-product-image-uploads/4601b89c-467c-41c5-9de5-ca44b55e74ec',
    //   },
    //   {
    //     id: '6ebb1df7-3beb-4f21-bbbb-e3b35849f5a0',
    //     productId: 2,
    //     variantId: 1,
    //     selectedOptions: [
    //       {
    //         optionId: 13,
    //       },
    //       {
    //         optionId: 11,
    //       },
    //     ],
    //     unitPrice: 0,
    //     quantity: 1,
    //     noDiscountUnitPrice: 31.5,
    //     productName: 'T-Shirt',
    //     pictureUrl:
    //       'https://ecombone.blob.core.windows.net/ecommbone-catalog-product-image-uploads/4601b89c-467c-41c5-9de5-ca44b55e74ec',
    //   },
    // ] as CartItemDto[]);
    return this._httpClient.get<CartItemDto[]>(
      `${this.BASKET_API_URL}/basket/v1/basket`
    );
  }
}
