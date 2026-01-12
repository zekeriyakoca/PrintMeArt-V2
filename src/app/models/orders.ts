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
