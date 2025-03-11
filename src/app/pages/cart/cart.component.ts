import {
  Component,
  HostBinding,
  Input,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';
import { BasePageComponent } from '../basePageComponent';
import { CartService } from '../../services/cart/cart.service';
import { CartItemDto } from '../../models/cart-item';
import { Router } from '@angular/router';
import { OrderSummaryComponent } from '../../components/shared/order-summary/order-summary.component';

@Component({
  selector: 'app-cart',
  imports: [CartItemComponent, OrderSummaryComponent],
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CartComponent extends BasePageComponent {
  @Input() @HostBinding('class') class: string = '';
  cartItems = signal<CartItemDto[]>([]);

  constructor(private cartService: CartService, private router: Router) {
    super();
    this.cartItems = this.cartService.cart;
  }

  ngOnInit() {}

  triggerRecalculateSummary() {
    this.cartItems.update((x) => {
      return [...x];
    });
  }
  navigateToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
