import { Component, HostBinding, Input, signal } from '@angular/core';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';
import { first } from 'rxjs';
import { BasePageComponent } from '../basePageComponent';
import { CartService } from '../../services/cart/cart.service';
import { CartItemDto } from '../../models/cart-item';
import { CartSummaryComponent } from '../../components/cart-summary/cart-summary.component';

@Component({
  selector: 'app-cart',
  imports: [CartItemComponent, CartSummaryComponent],
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent extends BasePageComponent {
  @Input() @HostBinding('class') class: string = '';
  cartItems = signal<CartItemDto[]>([]);

  constructor(private cartService: CartService) {
    super();
  }

  ngOnInit() {
    this.cartService
      .getCartItems()
      .pipe(first())
      .subscribe((cartItems) => {
        if (cartItems && cartItems.length > 0) {
          this.cartItems.set(cartItems ?? []);
        }
      });
  }
}
