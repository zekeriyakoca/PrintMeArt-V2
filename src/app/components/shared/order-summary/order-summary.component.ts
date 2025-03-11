import { Component, computed, input, signal } from '@angular/core';
import { CartItemDto } from '../../../models/cart-item';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  cartItems = input<CartItemDto[]>([]);
  shippingFee = signal(5);

  totalPrice = computed(() => {
    return this.cartItems()?.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0
    );
  });

  taxAmount = computed(() => this.totalPrice() * 0.08);

  totalPriceWithTax = computed(
    () => this.totalPrice() + this.taxAmount() + this.shippingFee()
  );
}
