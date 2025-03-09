import {
  Component,
  computed,
  effect,
  input,
  model,
  signal,
} from '@angular/core';
import { CartItemDto } from '../../models/cart-item';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart-summary',
  imports: [CurrencyPipe],
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.scss',
})
export class CartSummaryComponent {
  cartItems = input<CartItemDto[]>([]);
  shippingFee = signal(5);

  constructor() {}

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
