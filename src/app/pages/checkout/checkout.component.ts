import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostBinding,
  inject,
  Input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CheckoutUserInfoComponent } from '../../components/checkout-user-info/checkout-user-info.component';
import { OrderSummaryComponent } from '../../components/shared/order-summary/order-summary.component';
import { Router, RouterLink } from '@angular/router';
import { CartItemDto } from '../../models/cart-item';
import { CartService } from '../../services/cart/cart.service';
import { BasePageComponent } from '../basePageComponent';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { CheckoutUserInfo } from '../../models/checkout-user-info';
import {
  CheckoutService,
  CreateOrderFromDraftDto,
} from '../../services/checkout/checkout.service';
import { ToastService } from '../../services/toast/toast.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CheckoutUserInfoComponent,
    OrderSummaryComponent,
    RouterLink,
    IconComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CheckoutComponent extends BasePageComponent {
  @Input() @HostBinding('class') class: string = '';

  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthenticationService);

  cartItems = signal<CartItemDto[]>([]);
  isFormValid = signal<boolean>(false);
  isProcessing = signal<boolean>(false);
  currentOrderId = signal<number | null>(null);

  userDetails: CheckoutUserInfo = {
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    country: '',
    postalCode: '',
    houseNumber: '',
    addressDetails: '',
  };

  constructor() {
    super();
    this.cartItems = this.cartService.cart;
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.userDetails = {
        ...this.userDetails,
        email: this.authService.currentUser()?.email || '',
        firstName: this.authService.currentUser()?.name.split(' ')[0] || '',
        lastName: this.authService.currentUser()?.name.split(' ')[1] || '',
      };
    }
    // Create draft order when entering checkout
    this.checkoutService.createDraftOrder().subscribe({
      next: (response) => {
        console.log('Draft order created');
      },
      error: (err) => {
        console.error('Failed to create draft order:', err);
        this.toastService.error(
          'Failed to initialize checkout. Please try again.',
        );
      },
    });
  }

  private prepareOrderData(): CreateOrderFromDraftDto {
    return {
      customerFullName: `${this.userDetails.firstName} ${this.userDetails.lastName}`,
      customerEmail: this.userDetails.email,
      shipmentAddress: {
        city: this.userDetails.city,
        street:
          `${this.userDetails.houseNumber} ${this.userDetails.addressDetails}`.trim(),
        state: '',
        country: this.userDetails.country,
        zipCode: this.userDetails.postalCode,
      },
    };
  }

  confirmOrder() {
    if (!this.isFormValid() || this.isProcessing()) {
      return;
    }

    this.isProcessing.set(true);

    const orderData = this.prepareOrderData();

    // Step 1: Create order from draft with shipping details
    this.checkoutService.createOrderFromDraft(orderData).subscribe({
      next: (orderResponse) => {
        console.log('Order created:', orderResponse.orderId);

        // Step 2: Initiate Stripe checkout
        this.checkoutService
          .initiateCheckout({
            orderId: orderResponse.orderId,
            customerEmail: this.userDetails.email,
            currency: 'EUR',
          })
          .subscribe({
            next: (checkoutResponse) => {
              console.log('Checkout initiated:', checkoutResponse);

              // Store session ID for verification after redirect
              if (isPlatformBrowser(this.platformId)) {
                sessionStorage.setItem(
                  'checkoutSessionId',
                  checkoutResponse.sessionId,
                );
                sessionStorage.setItem('checkoutEmail', this.userDetails.email);
              }

              // Redirect to Stripe checkout
              if (checkoutResponse.checkoutUrl) {
                window.location.href = checkoutResponse.checkoutUrl;
              } else {
                this.isProcessing.set(false);
                this.toastService.error('Failed to create checkout session.');
              }
            },
            error: (err) => {
              console.error('Checkout initiation failed:', err);
              this.isProcessing.set(false);
              this.toastService.error(
                'Failed to initiate payment. Please try again.',
              );
            },
          });
      },
      error: (err) => {
        console.error('Order creation failed:', err);
        this.isProcessing.set(false);
        this.toastService.error('Failed to create order. Please try again.');
      },
    });
  }
}
