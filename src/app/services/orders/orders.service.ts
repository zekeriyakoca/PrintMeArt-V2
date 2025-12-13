import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions?: { name: string; value: string }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.serviceUrls['ordering-api'];

  /**
   * Get paginated list of orders for the current user
   */
  getOrders(page = 1, pageSize = 10): Observable<OrdersResponse> {
    // TODO: Implement API call
    // return this.http.get<OrdersResponse>(`${this.baseUrl}/orders`, {
    //   params: { page: page.toString(), pageSize: pageSize.toString() },
    // });
    return of({ data: [], total: 0, page, pageSize });
  }

  /**
   * Get a single order by ID
   */
  getOrder(orderId: string): Observable<Order> {
    // TODO: Implement API call
    // return this.http.get<Order>(`${this.baseUrl}/orders/${orderId}`);
    return of({} as Order);
  }

  /**
   * Cancel an order (only allowed for pending/confirmed orders)
   */
  cancelOrder(orderId: string): Observable<Order> {
    // TODO: Implement API call
    // return this.http.post<Order>(`${this.baseUrl}/orders/${orderId}/cancel`, {});
    return of({} as Order);
  }

  /**
   * Request a return for a delivered order
   */
  requestReturn(
    orderId: string,
    reason: string,
    itemIds?: string[],
  ): Observable<void> {
    // TODO: Implement API call
    // return this.http.post<void>(`${this.baseUrl}/orders/${orderId}/return`, {
    //   reason,
    //   itemIds,
    // });
    return of(undefined);
  }

  /**
   * Reorder — add all items from an existing order to cart
   */
  reorder(orderId: string): Observable<void> {
    // TODO: Implement API call
    // return this.http.post<void>(`${this.baseUrl}/orders/${orderId}/reorder`, {});
    return of(undefined);
  }

  /**
   * Get order tracking info
   */
  getTracking(orderId: string): Observable<{
    trackingNumber?: string;
    trackingUrl?: string;
    status: string;
    events: { date: string; description: string; location?: string }[];
  }> {
    // TODO: Implement API call
    // return this.http.get(`${this.baseUrl}/orders/${orderId}/tracking`);
    return of({ status: '', events: [] });
  }
}
