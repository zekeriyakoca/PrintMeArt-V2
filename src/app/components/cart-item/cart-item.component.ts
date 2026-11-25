import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, inject, model, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  CartItemDto,
  SelectedOptionDto,
  getDisplayableOptions,
} from '../../models/cart-item';
import { CartService } from '../../services/cart/cart.service';
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
    const item = this.cartItem();
    if (item?.id) {
      this.cartService.removeItemFromCart(item.id);
      this.cartItemChanged.emit();
    }
  }

  changeQuantity(change: number) {
    const item = this.cartItem();
    if (!item) return;

    this.cartService.changeQuantity(item, change);
    this.cartItemChanged.emit();
  }

  goToProduct() {
    // A custom design has no product page to go to
    if (this.isCustom) return;
    this.router.navigate(['/products', this.cartItem()?.productId]);
  }
}
