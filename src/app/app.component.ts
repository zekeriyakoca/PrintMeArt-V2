import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartAddedModalComponent } from './components/cart-added-modal/cart-added-modal.component';
import { CartSidebarComponent } from './components/cart-sidebar/cart-sidebar.component';
import { CartService } from './services/cart/cart.service';
import { AppInsightsService } from './services/telemetry/app-insights.service';
import { GoogleAnalyticsService } from './services/telemetry/google-analytics.service';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { Bootstrap } from './services/bootstrap/bootstrap';
import { ApiService } from './services/api/api.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CartAddedModalComponent,
    CartSidebarComponent,
    CookieConsentComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'StoreFront';

  constructor(
    private cartService: CartService,
    private telemetry: AppInsightsService,
    private googleAnalytics: GoogleAnalyticsService,
    private bootstrap: Bootstrap,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    this.telemetry.init();
    this.googleAnalytics.init();
    this.cartService.fetchCartItems();
    this.bootstrap.fetchShippingInfo();
    this.apiService.fetchFromPrice();
  }
}
