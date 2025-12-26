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
  shippingFee = computed(() => (this.itemsTotal() >= 50 ? 0 : 5.99));
  taxRate = 0.08;

  itemsTotal = computed(() => {
    const items = this.cartItems() ?? [];
    return items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );
  });

  // Vergi zaten fiyatın içindeyse: içindeki vergi payı
  taxAmount = computed(
    () => (this.itemsTotal() * this.taxRate) / (1 + this.taxRate),
  );

  // Toplam (vergi dahil) + kargo  (tax'i tekrar ekleme!)
  totalPriceWithTax = computed(
    () => this.itemsTotal() + (this.shippingFee() ?? 0),
  );
}
