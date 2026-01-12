import {
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BasePageComponent } from '../basePageComponent';
import { IconComponent } from '../../components/shared/icon/icon.component';
import {
  CheckoutService,
  CheckoutSessionStatus,
} from '../../services/checkout/checkout.service';
import { CartService } from '../../services/cart/cart.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss',
})
export class PaymentSuccessComponent
  extends BasePageComponent
  implements OnInit
{
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthenticationService);

  isLoading = signal(true);

  /** Whether the current user is authenticated (can access orders page) */
  isAuthenticated = computed(() => this.auth.isAuthenticated());
  isSuccess = signal(false);
  sessionData = signal<CheckoutSessionStatus | null>(null);
  errorMessage = signal<string>('');

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Get session_id from URL query params (Stripe redirect)
    const sessionId =
      this.route.snapshot.queryParamMap.get('session_id') ||
      sessionStorage.getItem('checkoutSessionId');

    if (!sessionId) {
      this.isLoading.set(false);
      this.errorMessage.set('No checkout session found.');
      return;
    }

    // Verify the checkout session with backend
    this.checkoutService.getCheckoutSession(sessionId).subscribe({
      next: (session) => {
        this.sessionData.set(session);

        if (session.status === 'complete' && session.paymentStatus === 'paid') {
          this.isSuccess.set(true);
          // Clear the cart after successful payment
          this.cartService.clearCart();
          // Clean up session storage
          sessionStorage.removeItem('checkoutSessionId');
          sessionStorage.removeItem('checkoutEmail');
        } else {
          this.errorMessage.set('Payment was not completed.');
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to verify checkout session:', err);
        this.errorMessage.set(
          'Failed to verify payment. Please contact support.',
        );
        this.isLoading.set(false);
      },
    });
  }

  get orderNumber(): string {
    return this.sessionData()?.orderNumber || 'N/A';
  }

  get customerEmail(): string {
    return (
      this.sessionData()?.customerEmail ||
      sessionStorage.getItem('checkoutEmail') ||
      ''
    );
  }

  get formattedAmount(): string {
    const data = this.sessionData();
    if (!data?.amountTotal || !data?.currency) {
      return '';
    }
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: data.currency.toUpperCase(),
    }).format(data.amountTotal / 100);
  }
}
