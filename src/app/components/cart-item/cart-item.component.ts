import { Component, input } from '@angular/core';
import { CartItemDto } from '../../models/cart-item';

@Component({
  selector: 'app-cart-item',
  imports: [],
  standalone: true,
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {
  cartItem = input<CartItemDto>();
}
