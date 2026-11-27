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

export interface CreateOrderDto {
  customerFullName: string;
  customerEmail: string;
  shipmentAddress: AddressDto;
  /** Items + shipping as the page shows it; the backend makes the order only when it charges exactly this */
  expectedTotal: number;
}

/** The 409 answer to an order that would charge another total than the page showed */
export interface OrderTotalMismatch {
  pricesUpdated: boolean;
  basketChanged: boolean;
  /** What the order will charge for the basket as it is now */
  total: number;
  items: { id: string; unitPrice: number }[];
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
  items?: { productId: number; variantId: number; productName: string; unitPrice: number; units: number }[];
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

  checkBasket() {
    return this.apiService.checkBasket();
  }

  saveCheckoutContact(contact: { email: string; firstName: string; lastName: string }) {
    return this.apiService.saveCheckoutContact(contact);
  }

  createOrder(data: CreateOrderDto) {
    return this.apiService.submitOrder(data);
  }

  initiateCheckout(data: CheckoutRequestDto) {
    return this.apiService.initiateCheckout(data);
  }

  getCheckoutSession(sessionId: string) {
    return this.apiService.getCheckoutSession(sessionId);
  }
}
