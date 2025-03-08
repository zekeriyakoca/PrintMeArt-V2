import { Component, input } from '@angular/core';
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
  cartItem = input<CartItemDto>();

  constructor(private cartService: CartService) {}

  removeItem() {
    if (this.cartItem()?.id) {
      this.cartService.removeItemFromCart(this.cartItem()?.id);
    }
  }
}
