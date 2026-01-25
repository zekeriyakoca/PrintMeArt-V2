import { Component, computed, input } from '@angular/core';
import { CartItemDto } from '../../../models/cart-item';
import { CurrencyPipe } from '@angular/common';
import { Bootstrap } from '../../../services/bootstrap/bootstrap';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe, IconComponent],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  cartItems = input<CartItemDto[]>([]);
  shippingFee = computed(() => {
    const shippingInfo = this.bootstrap.shippingInfo();
    const shippingFee = shippingInfo?.shippingFee ?? 4.95;
    return this.itemsTotal() >= shippingInfo?.freeShippingThreshold
      ? 0
      : shippingFee;
  });
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

  constructor(private bootstrap: Bootstrap) {}
}
