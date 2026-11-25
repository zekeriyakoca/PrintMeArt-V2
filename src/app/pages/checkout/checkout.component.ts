import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, HostBinding, HostListener, inject, Input, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { first } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { CheckoutUserInfoComponent } from '../../components/checkout-user-info/checkout-user-info.component';
import { OrderSummaryComponent } from '../../components/shared/order-summary/order-summary.component';
import { RouterLink } from '@angular/router';
import { CartItemDto } from '../../models/cart-item';
import { CartService } from '../../services/cart/cart.service';
import { BasePageComponent } from '../basePageComponent';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { CheckoutUserInfo } from '../../models/checkout-user-info';
import { CheckoutService, CreateOrderDto, OrderTotalMismatch } from '../../services/checkout/checkout.service';
import { ToastService } from '../../services/toast/toast.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { AnalyticsService } from '../../services/telemetry/analytics.service';
import { UserService } from '../../services/user/user.service';
import { validationErrors } from '../../utils/validation-errors';
import { isFrameOutOfStock } from '../../shared/constants';

/** Order request fields the backend validates, and the form field each one is shown under */
const ORDER_FIELDS: Record<string, keyof CheckoutUserInfo> = {
  customerFullName: 'firstName',
  customerEmail: 'email',
  'shipmentAddress.street': 'street',
  'shipmentAddress.city': 'city',
  'shipmentAddress.country': 'country',
  'shipmentAddress.zipCode': 'postalCode',
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [TranslatePipe, CheckoutUserInfoComponent, OrderSummaryComponent, RouterLink, IconComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CheckoutComponent extends BasePageComponent {
  @Input() @HostBinding('class') class: string = '';

  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthenticationService);
  private readonly analytics = inject(AnalyticsService);
  private readonly userService = inject(UserService);

  /** Offered to signed-out customers only; not on the server, which does not know who is signed in */
  readonly showGoogleFill = computed(() => isPlatformBrowser(this.platformId) && !this.authService.currentUser());
  cartItems = signal<CartItemDto[]>([]);
  isFormValid = signal<boolean>(false);
  isProcessing = signal<boolean>(false);
  currentOrderId = signal<number | null>(null);
  serverErrors = signal<Partial<Record<keyof CheckoutUserInfo, string[]>>>({});
  // The name and email last sent to the backend, so each blur does not send them again
  private savedContactKey = '';
  private readonly orderSummary = viewChild(OrderSummaryComponent);
  // After the backend refused a total: the basket it was looking at and the total it will charge for it
  private agreedTotal: { basket: string; total: number } | null = null;

  userDetails: CheckoutUserInfo = {
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    country: 'NL',
    postalCode: '',
    street: '',
    addressDetails: '',
  };

  constructor() {
    super();
    this.cartItems = this.cartService.cart;

    toObservable(this.cartItems)
      .pipe(first((items) => items.length > 0))
      .subscribe((items) => this.analytics.trackCheckoutStarted(items));
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.prefill(this.authService.currentUser()?.name || '', this.authService.currentUser()?.email || '');
      // The saved address fills in the rest; the order itself never changes it
      this.userService.getProfile().subscribe((profile) => {
        const address = profile.defaultAddress;
        this.prefill(address?.name || profile.fullName || '', profile.email || '');
        if (address) {
          this.userDetails = {
            ...this.userDetails,
            street: this.userDetails.street || address.street1,
            addressDetails: this.userDetails.addressDetails || address.street2 || '',
            city: this.userDetails.city || address.city,
            postalCode: this.userDetails.postalCode || address.zip,
            country: this.userDetails.postalCode ? this.userDetails.country : address.country,
          };
        }
      });
    }
    // The backend checks the basket and brings its prices up to date
    this.checkoutService.checkBasket().subscribe({
      next: (result: { pricesUpdated?: boolean } | null) => {
        // The backend found newer prices and saved them to the basket; show what will be charged
        if (result?.pricesUpdated) {
          this.cartService.fetchCartItems();
          this.toastService.info('checkout.pricesUpdated');
        }
      },
      error: (err) => {
        console.error('Failed to check the basket:', err);
        this.analytics.trackCheckoutFailed('basket_check', `http_${err?.status ?? 'unknown'}`);
        this.toastService.error('errors.checkoutInit');
      },
    });
  }

  /** Back from Stripe with the browser's back button, the page comes out of the cache as it was left: still processing */
  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: PageTransitionEvent) {
    if (event.persisted) this.isProcessing.set(false);
  }

  /** Sends the name and email as soon as they are typed, so a checkout that fails later can still be followed up */
  saveContact() {
    const email = this.userDetails.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    const contact = { email, firstName: this.userDetails.firstName.trim(), lastName: this.userDetails.lastName.trim() };
    const key = `${contact.email}|${contact.firstName}|${contact.lastName}`;
    if (key === this.savedContactKey) return;
    this.savedContactKey = key;

    this.analytics.setCheckoutContact(email, `${contact.firstName} ${contact.lastName}`.trim());
    this.checkoutService.saveCheckoutContact(contact).subscribe({
      error: () => (this.savedContactKey = ''),
    });
  }

  /** Signs in with Google and comes back here, where the form is filled from the account */
  signInWithGoogle() {
    this.authService.login('/checkout');
  }

  /** Fills the name and email the customer has not typed yet */
  private prefill(fullName: string, email: string) {
    const [first = '', ...rest] = fullName.trim().split(/\s+/);
    this.userDetails = {
      ...this.userDetails,
      email: this.userDetails.email || email,
      firstName: this.userDetails.firstName || first,
      lastName: this.userDetails.lastName || rest.join(' '),
    };
  }

  /** The basket and destination a total belongs to */
  private basketKey(): string {
    return JSON.stringify([this.userDetails.country, this.cartItems().map((item) => [item.id, item.quantity, item.unitPrice])]);
  }

  /**
   * The total the customer is looking at. Right after the backend refused a total it is the one the
   * backend named for this same basket, so the next try always goes through, even if this page
   * would add it up differently.
   */
  private expectedTotal(): number {
    if (this.agreedTotal?.basket === this.basketKey()) return this.agreedTotal.total;
    return Math.round((this.orderSummary()?.total() ?? 0) * 100) / 100;
  }

  /** The order would charge another total than shown: show the basket as it will be charged and let the customer pay again */
  private showChangedBasket(change: OrderTotalMismatch) {
    this.cartService.reloadWithPrices(change.items ?? []).subscribe({
      next: () => {
        this.agreedTotal = { basket: this.basketKey(), total: change.total };
        this.isProcessing.set(false);
        this.toastService.info(change.pricesUpdated ? 'checkout.pricesUpdated' : 'checkout.basketChanged');
      },
      error: () => {
        this.isProcessing.set(false);
        this.toastService.error('errors.order');
      },
    });
  }

  private prepareOrderData(): CreateOrderDto {
    return {
      expectedTotal: this.expectedTotal(),
      customerFullName: `${this.userDetails.firstName} ${this.userDetails.lastName}`,
      customerEmail: this.userDetails.email,
      shipmentAddress: {
        city: this.userDetails.city,
        street: `${this.userDetails.street} ${this.userDetails.addressDetails}`.trim(),
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

    // A framed print that is out of stock for now can't be ordered; the bag shows which one
    if (this.cartItems().some((item) => item.selectedOptions?.some((o) => isFrameOutOfStock(o.optionName)))) {
      this.toastService.error('errors.frameOutOfStock');
      return;
    }

    this.isProcessing.set(true);

    const orderData = this.prepareOrderData();

    // Step 1: Create the order from the basket with shipping details
    this.checkoutService.createOrder(orderData).subscribe({
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
              this.analytics.trackPaymentStarted(orderResponse.orderId, 'EUR', this.cartItems());

              // Store session ID for verification after redirect
              if (isPlatformBrowser(this.platformId)) {
                sessionStorage.setItem('checkoutSessionId', checkoutResponse.sessionId);
                sessionStorage.setItem('checkoutEmail', this.userDetails.email);
              }

              // Redirect to Stripe checkout
              if (checkoutResponse.checkoutUrl) {
                window.location.href = checkoutResponse.checkoutUrl;
              } else {
                this.isProcessing.set(false);
                this.toastService.error('errors.checkoutSession');
              }
            },
            error: (err) => {
              console.error('Checkout initiation failed:', err);
              this.analytics.trackPaymentFailed('checkout_initiation_failed', orderResponse.orderId);
              this.analytics.trackCheckoutFailed('payment', `http_${err?.status ?? 'unknown'}`);
              this.isProcessing.set(false);
              this.toastService.error('errors.payment');
            },
          });
      },
      error: (err) => {
        if (err?.status === 409) {
          this.showChangedBasket(err.error);
          return;
        }
        console.error('Order creation failed:', err);
        this.analytics.trackPaymentFailed('order_creation_failed');
        this.analytics.trackCheckoutFailed('create_order', `http_${err?.status ?? 'unknown'}`);
        this.isProcessing.set(false);
        const errors = validationErrors(err);
        if (errors) {
          // The messages go under their fields; the error toast already shows the first one
          const byField: Partial<Record<keyof CheckoutUserInfo, string[]>> = {};
          for (const [key, messages] of Object.entries(errors)) {
            const field = ORDER_FIELDS[key];
            if (field) byField[field] = [...(byField[field] ?? []), ...messages];
          }
          this.serverErrors.set(byField);
        } else {
          this.toastService.error('errors.order');
        }
      },
    });
  }
}
