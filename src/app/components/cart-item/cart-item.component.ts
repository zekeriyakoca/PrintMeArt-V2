import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, inject, model, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  CartItemDto,
  SelectedOptionDto,
  getDisplayableOptions,
} from '../../models/cart-item';
import { CartService } from '../../services/cart/cart.service';
import { AnalyticsService } from '../../services/telemetry/analytics.service';
import { IconComponent } from '../shared/icon/icon.component';
import { CurrencyPipe } from '@angular/common';
import { isFrameOutOfStock } from '../../shared/constants';

@Component({
  selector: 'app-cart-item',
  imports: [TranslatePipe, IconComponent, CurrencyPipe],
  standalone: true,
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {
  cartItem = model<CartItemDto>();
  cartItemChanged = output();

  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);

  constructor(private cartService: CartService) {}

  /** Get displayable options (filters out internal options like CustomProductUrl) */
  get displayOptions(): SelectedOptionDto[] {
    return getDisplayableOptions(this.cartItem()?.selectedOptions);
  }

  /** A design made from the customer's own image */
  get isCustom(): boolean {
    return !!this.cartItem()?.selectedOptions?.some((o) => o.optionName === 'CustomProductUrl');
  }

  /** The item has a frame that is out of stock for now */
  get frameOutOfStock(): boolean {
    return !!this.cartItem()?.selectedOptions?.some((o) => isFrameOutOfStock(o.optionName));
  }

  removeItem() {
    if (this.cartItem()?.id) {
      this.cartService.removeItemFromCart(this.cartItem()?.id);
      this.cartItemChanged.emit();
    }
  }

  changeQuantity(change: number) {
    const updatedCart = this.cartService.cart().map((item) => {
      if (item.id === this.cartItem()?.id) {
        return {
          ...item,
          quantity: item.quantity + change,
        };
      }
      return item;
    });

    const item = this.cartItem();
    if (item) this.analytics.trackCartQuantityChanged(item, change);

    this.cartService.updateCartOnBackend(updatedCart).subscribe();
    this.cartItemChanged.emit();
  }

  goToProduct() {
    // A custom design has no product page to go to
    if (this.isCustom) return;
    this.router.navigate(['/products', this.cartItem()?.productId]);
  }
}
