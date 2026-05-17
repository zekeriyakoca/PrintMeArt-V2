import { Component, HostBinding, Input, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { first } from 'rxjs/operators';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';
import { BasePageComponent } from '../basePageComponent';
import { CartService } from '../../services/cart/cart.service';
import { CartItemDto } from '../../models/cart-item';
import { Router, RouterLink } from '@angular/router';
import { OrderSummaryComponent } from '../../components/shared/order-summary/order-summary.component';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { AnalyticsService } from '../../services/telemetry/analytics.service';

@Component({
  selector: 'app-cart',
  imports: [CartItemComponent, OrderSummaryComponent, RouterLink, IconComponent],
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CartComponent extends BasePageComponent {
  @Input() @HostBinding('class') class: string = '';
  cartItems = signal<CartItemDto[]>([]);

  constructor(
    private cartService: CartService,
    private router: Router,
    private analytics: AnalyticsService,
  ) {
    super();
    this.cartItems = this.cartService.cart;

    toObservable(this.cartItems)
      .pipe(first((items) => items.length > 0))
      .subscribe((items) => this.analytics.trackCartViewed(items));
  }

  triggerRecalculateSummary() {
    this.cartItems.update((x) => {
      return [...x];
    });
  }
  navigateToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
