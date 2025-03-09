import { Component, model } from '@angular/core';
import { CartItemDto } from '../../models/cart-item';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-cart-item',
  imports: [],
  standalone: true,
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {
  cartItem = model<CartItemDto>();

  constructor(private cartService: CartService) {}

  removeItem() {
    if (this.cartItem()?.id) {
      this.cartService.removeItemFromCart(this.cartItem()?.id);
    }
  }

  changeQuantity(change: number) {
    this.cartItem.update((x) => {
      if (x) {
        x.quantity += change;
      }
      return x;
    });
  }
}
