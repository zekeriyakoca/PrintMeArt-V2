import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

// Backend status enum values
export type BackendOrderStatus =
  | 'PendingForPayment'
  | 'PaymentFailed'
  | 'Paid'
  | 'AwaitingValidation'
  | 'StockConfirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled'
  | 'Returning'
  | 'Returned'
  | 'RefundRequested'
  | 'Refunded';

// UI status groups for tabs
export type OrderStatusGroup =
  | 'all'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// List DTO (orders listing)
export interface OrderSummary {
  id: number;
  orderNumber: string;
  status: BackendOrderStatus;
  statusGroup: number;
  orderItemsCount: number;
  orderCreatedDate: string;
  address: string;
  total: number;
  buyerName: string;
  trackingNumber: string;
  canCancel: boolean;
  cancelReason: string | null;
}

// Detail DTO (single order details)
export interface OrderItemDto {
  productId: number;
  variantId: number;
  productName: string;
  pictureUrl: string;
  unitPrice: number;
  discount: number;
  units: number;
  selectedOptions: Array<unknown>;
}

export interface OrderDto {
  orderId: number;
  orderNumber: string;
  date: string;
  status: BackendOrderStatus;
  statusGroup: number;
  description: string;
  address: {
    city: string;
    street: string;
    state: string;
    country: string;
    zipCode: string;
  };
  orderItems: OrderItemDto[];
  subtotal: number;
  shippingCost: number;
  total: number;
  trackingNumber: string;
  canCancel: boolean;
  cancelReason: string | null;
}

export interface OrdersResponse {
  data: OrderSummary[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface CanCancelResponse {
  canCancel: boolean;
  reason?: string;
}

export interface CancelOrderRequest {
  reason?: string;
}

// Status group mapping for UI tabs
export const STATUS_GROUP_MAP: Record<OrderStatusGroup, BackendOrderStatus[]> =
  {
    all: [],
    pending: ['PendingForPayment', 'PaymentFailed'],
    processing: ['Paid', 'AwaitingValidation', 'StockConfirmed'],
    shipped: ['Shipped'],
    delivered: ['Delivered', 'Completed'],
    cancelled: [
      'Cancelled',
      'Returning',
      'Returned',
      'RefundRequested',
      'Refunded',
    ],
  };

// Cancellable statuses
export const CANCELLABLE_STATUSES: BackendOrderStatus[] = [
  'PendingForPayment',
  'PaymentFailed',
  'Paid',
  'AwaitingValidation',
];

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly bffUrl = environment.serviceUrls['bff'];

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Get paginated list of orders for the current user
   */
  getOrders(
    params: {
      status?: OrderStatusGroup;
      pageIndex?: number;
      pageSize?: number;
      searchTerm?: string;
    } = {},
  ): Observable<OrdersResponse> {
    if (!this.isBrowser) {
      return of({
        data: [],
        totalCount: 0,
        pageIndex: 0,
        pageSize: 10,
        totalPages: 0,
      });
    }

    let httpParams = new HttpParams();

    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.pageIndex !== undefined) {
      httpParams = httpParams.set('pageIndex', params.pageIndex.toString());
    }
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<OrdersResponse>(
      `${this.bffUrl}/bff/v1/ordering/orders`,
      { params: httpParams },
    );
  }

  /**
   * Get a single order by ID
   */
  getOrder(orderId: number): Observable<OrderDto> {
    if (!this.isBrowser) {
      return of({} as OrderDto);
    }
    return this.http.get<OrderDto>(
      `${this.bffUrl}/bff/v1/ordering/orders/${orderId}`,
    );
  }

  /**
   * Check if an order can be cancelled
   */
  canCancelOrder(orderId: number): Observable<CanCancelResponse> {
    if (!this.isBrowser) {
      return of({ canCancel: false });
    }
    return this.http.get<CanCancelResponse>(
      `${this.bffUrl}/bff/v1/ordering/orders/${orderId}/can-cancel`,
    );
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: number, reason?: string): Observable<void> {
    if (!this.isBrowser) {
      return of(undefined);
    }
    const body: CancelOrderRequest = reason ? { reason } : {};
    return this.http.post<void>(
      `${this.bffUrl}/bff/v1/ordering/orders/${orderId}/cancel`,
      body,
    );
  }

  /**
   * Get display color classes for a status
   */
  getStatusColor(status: BackendOrderStatus): string {
    const colorMap: Record<string, string> = {
      // Pending group - yellow/amber
      PendingForPayment: 'bg-amber-100 text-amber-800',
      PaymentFailed: 'bg-red-100 text-red-800',
      // Processing group - blue/indigo
      Paid: 'bg-blue-100 text-blue-800',
      AwaitingValidation: 'bg-indigo-100 text-indigo-800',
      StockConfirmed: 'bg-violet-100 text-violet-800',
      // Shipped - purple
      Shipped: 'bg-purple-100 text-purple-800',
      // Delivered group - green
      Delivered: 'bg-green-100 text-green-800',
      Completed: 'bg-emerald-100 text-emerald-800',
      // Cancelled group - gray/red
      Cancelled: 'bg-slate-100 text-slate-600',
      Returning: 'bg-orange-100 text-orange-800',
      Returned: 'bg-slate-200 text-slate-700',
      RefundRequested: 'bg-rose-100 text-rose-800',
      Refunded: 'bg-slate-100 text-slate-600',
    };
    return colorMap[status] || 'bg-slate-100 text-slate-600';
  }

  /**
   * Get status group for a backend status
   */
  getStatusGroup(status: BackendOrderStatus): OrderStatusGroup {
    for (const [group, statuses] of Object.entries(STATUS_GROUP_MAP)) {
      if (statuses.includes(status)) {
        return group as OrderStatusGroup;
      }
    }
    return 'all';
  }

  /**
   * Check if status is in a cancellable state (client-side check)
   */
  isCancellable(status: BackendOrderStatus): boolean {
    return CANCELLABLE_STATUSES.includes(status);
  }

  /**
   * Format status for display (spaces and readable format)
   */
  formatStatusDisplay(status: BackendOrderStatus): string {
    const displayMap: Record<BackendOrderStatus, string> = {
      PendingForPayment: 'Pending Payment',
      PaymentFailed: 'Payment Failed',
      Paid: 'Paid',
      AwaitingValidation: 'Validating',
      StockConfirmed: 'Confirmed',
      Shipped: 'Shipped',
      Delivered: 'Delivered',
      Completed: 'Completed',
      Cancelled: 'Cancelled',
      Returning: 'Returning',
      Returned: 'Returned',
      RefundRequested: 'Refund Requested',
      Refunded: 'Refunded',
    };
    return displayMap[status] || status;
  }
}
