import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostBinding,
  Input,
  signal,
} from '@angular/core';
import { CheckoutUserInfoComponent } from '../../components/checkout-user-info/checkout-user-info.component';
import { OrderSummaryComponent } from '../../components/shared/order-summary/order-summary.component';
import { Router } from '@angular/router';
import { CartItemDto } from '../../models/cart-item';
import { CartService } from '../../services/cart/cart.service';
import { BasePageComponent } from '../basePageComponent';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CheckoutUserInfoComponent, OrderSummaryComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CheckoutComponent extends BasePageComponent {
  @Input() @HostBinding('class') class: string = '';
  cartItems = signal<CartItemDto[]>([]);

  constructor(private cartService: CartService, private router: Router) {
    super();
    this.cartItems = this.cartService.cart;
  }

  ngOnInit() {}

  navigateToPayment() {
    this.router.navigate(['/payment']);
  }
}
