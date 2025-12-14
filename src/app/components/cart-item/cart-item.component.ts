import { Component, model, output } from '@angular/core';
import { CartItemDto } from '../../models/cart-item';
import { CartService } from '../../services/cart/cart.service';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-cart-item',
  imports: [IconComponent],
  standalone: true,
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {
  cartItem = model<CartItemDto>();
  cartItemChanged = output();

  constructor(private cartService: CartService) {}

  removeItem() {
    if (this.cartItem()?.id) {
      this.cartService.removeItemFromCart(this.cartItem()?.id);
    }
  }

  changeQuantity(change: number) {
    this.cartItemChanged.emit();
    this.cartItem.update((x) => {
      if (x) {
        x.quantity += change;
      }
      return x;
    });
  }
}
