import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

// Re-export types for convenience
export interface AddressDto {
  city: string;
  street: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface CreateOrderFromDraftDto {
  customerFullName: string;
  customerEmail: string;
  shipmentAddress: AddressDto;
}

export interface CheckoutRequestDto {
  orderId: number;
  customerEmail: string;
  currency: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface CheckoutSessionStatus {
  sessionId: string;
  status: 'open' | 'complete' | 'expired';
  paymentStatus: 'unpaid' | 'paid' | 'no_payment_required';
  customerEmail?: string;
  orderId?: number;
  orderNumber?: string;
  amountTotal?: number;
  currency?: string;
}

/**
 * CheckoutService - Thin wrapper around ApiService for checkout operations.
 * Types are exported from here for convenience, actual API calls delegate to ApiService.
 */
@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  constructor(private readonly apiService: ApiService) {}

  createDraftOrder() {
    return this.apiService.createDraftOrder();
  }

  createOrderFromDraft(data: CreateOrderFromDraftDto) {
    return this.apiService.submitOrder(data);
  }

  initiateCheckout(data: CheckoutRequestDto) {
    return this.apiService.initiateCheckout(data);
  }

  getCheckoutSession(sessionId: string) {
    return this.apiService.getCheckoutSession(sessionId);
  }
}
