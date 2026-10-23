import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../services/i18n/translate.pipe';
import { Component, computed, input } from '@angular/core';
import { CartItemDto } from '../../../models/cart-item';
import { CurrencyPipe } from '@angular/common';
import { Bootstrap } from '../../../services/bootstrap/bootstrap';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-order-summary',
  imports: [RouterLink, TranslatePipe, CurrencyPipe, IconComponent],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  cartItems = input<CartItemDto[]>([]);
  country = input<string>('');
  shippingFee = computed(() =>
    this.bootstrap.shippingCost(this.country(), this.itemsTotal()),
  );

  itemsTotal = computed(() => {
    const items = this.cartItems() ?? [];
    return items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );
  });

  // Fiyatlar BTW dahil: toplam = ara toplam + kargo (Stripe'ın çektiği tutar)
  total = computed(() => this.itemsTotal() + (this.shippingFee() ?? 0));

  // Toplamın içindeki BTW payı (%21, fiyata dahil)
  vatAmount = computed(() => this.total() - this.total() / 1.21);

  constructor(private bootstrap: Bootstrap) {}
}
