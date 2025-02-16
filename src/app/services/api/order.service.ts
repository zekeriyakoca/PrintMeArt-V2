import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedItems } from '../../models/shared-models';
import { OrderDto, OrderSearchRequestDto, OrderSimpleDto } from '../../models/orders';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private _httpClient: HttpClient) {
  }

  getOrders(
    pageIndex: number,
    pageSize: number,
    searchTerm: string
  ): Observable<PaginatedItems<OrderSimpleDto>> {
    const request = new OrderSearchRequestDto(pageIndex, pageSize);
    request.searchTerm = searchTerm;

    return this._httpClient.post<PaginatedItems<OrderSimpleDto>>(
      `${environment.serviceUrls['ordering-api']}/ordering/v1/order/search`,
      request
    );
  }

  getOrder(id: number): Observable<OrderDto | undefined> {
    return this._httpClient.get<OrderDto>(
      `${environment.serviceUrls['ordering-api']}/ordering/v1/order/${id}`
    );
  }

  deleteOrder(id: number): Observable<void> {
    return this._httpClient.delete<void>(
      `${environment.serviceUrls['ordering-api']}/ordering/v1/order/${id}`
    );
  }

  updateOrderStatus(orderId: number, status: string): Observable<object> {
    if (orderId === 0) {
      throw new Error('Order id is required');
    }

    return this._httpClient.put(
      `${environment.serviceUrls['ordering-api']}/ordering/v1/order/${orderId}/update-status?status=${status}`,
      {}
    );
  }

  // updateProduct(product: UpdateProductRequestDto) {
  //   if (product.id === 0) {
  //     throw new Error('Product id is required');
  //   }

  //   const body = {...product, images : product.imageDtos.map((image) => image.original)};
  //   return this._httpClient.put(
  //     `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${product.id}`,
  //     body
  //   );
  // }
}
