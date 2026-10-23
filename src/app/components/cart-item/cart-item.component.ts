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

    this.cartService.updateCartOnBackend(updatedCart).subscribe();
    this.cartItemChanged.emit();
  }

  goToProduct() {
    this.router.navigate(['/products', this.cartItem()?.productId]);
  }
}
