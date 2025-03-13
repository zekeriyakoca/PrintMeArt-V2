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
import { ApiService } from '../../services/api/api.service';
import { first } from 'rxjs';

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

  userDetails: any = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    addressDetails: '',
    city: '',
    postalCode: '',
    country: '',
  };

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router
  ) {
    super();
    this.cartItems = this.cartService.cart;
  }

  ngOnInit() {
    this.apiService
      .createDraftOrder()
      .pipe(first())
      .subscribe(() => {
        console.log('Draft order created');
      });
  }

  prepareOrderData() {
    return {
      customerFullName: `${this.userDetails.firstName} ${this.userDetails.lastName}`,
      shipmentAddress: {
        city: this.userDetails.city,
        street: this.userDetails.addressDetails,
        state: this.userDetails.country,
        country: this.userDetails.country,
        zipCode: this.userDetails.postalCode,
      },
    };
  }

  confirmOrder() {
    const orderData = this.prepareOrderData();
    this.apiService
      .submitOrder(orderData)
      .pipe(first())
      .subscribe(() => {
        console.log('Order confirmed');
      });

    this.router.navigate(['/home']);
  }
}
