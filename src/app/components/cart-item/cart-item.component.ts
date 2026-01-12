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
}
