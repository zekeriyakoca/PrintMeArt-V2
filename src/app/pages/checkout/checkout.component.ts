import { Component } from '@angular/core';
import { CheckoutUserInfoComponent } from '../../componets/checkout-user-info/checkout-user-info.component';

@Component({
  selector: 'app-checkout',
  imports: [CheckoutUserInfoComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {}
