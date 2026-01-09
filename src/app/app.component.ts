import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartAddedModalComponent } from './components/cart-added-modal/cart-added-modal.component';
import { CartSidebarComponent } from './components/cart-sidebar/cart-sidebar.component';
import { CartService } from './services/cart/cart.service';
import { AppInsightsService } from './services/telemetry/app-insights.service';
import { GoogleAnalyticsService } from './services/telemetry/google-analytics.service';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

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
  private platformId = inject(PLATFORM_ID);

  constructor(
    private cartService: CartService,
    private router: Router,
    private telemetry: AppInsightsService,
    private googleAnalytics: GoogleAnalyticsService,
  ) {}

  ngOnInit() {
    this.telemetry.init();
    this.googleAnalytics.init();
    this.cartService.fetchCartItems();
    this.setupScrollToTop();
  }

  private setupScrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
  }
}
