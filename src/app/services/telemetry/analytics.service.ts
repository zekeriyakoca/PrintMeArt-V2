import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, first } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItemDto } from '../../models/cart-item';
import { ProductDto, ProductSimpleDto } from '../../models/product';
import { CookieConsentService } from '../consent/cookie-consent.service';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

type AnalyticsValue = string | number | boolean | null | undefined | AnalyticsValue[] | { [key: string]: AnalyticsValue };

type AnalyticsProperties = Record<string, AnalyticsValue>;

type AnalyticsConfig = {
  enabled?: boolean;
  tenant?: string;
  ga4MeasurementId?: string;
  posthogKey?: string;
  posthogHost?: string;
  pageViewsWithoutConsent?: boolean;
};

type TrackOptions = {
  ga4?: boolean;
  posthog?: boolean;
};

type QueuedEvent = {
  name: string;
  properties: AnalyticsProperties;
  sendGa4: boolean;
  sendPosthog: boolean;
};

const GA4_EVENTS = new Set(['view_item_list', 'view_item', 'search', 'add_to_cart', 'remove_from_cart', 'view_cart', 'begin_checkout', 'add_payment_info', 'purchase']);

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private initialized = false;
  private ga4Initialized = false;
  private posthogInitialized = false;
  private pageViewsStarted = false;
  private posthog?: { capture: (name: string, props?: AnalyticsProperties) => void };
  private readonly queue: QueuedEvent[] = [];

  private readonly config: AnalyticsConfig = (environment as { analytics?: AnalyticsConfig }).analytics ?? {};

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly cookieConsentService: CookieConsentService,
    private readonly router: Router,
  ) {}

  init(): void {
    if (this.initialized || !this.isEnabled()) return;
    this.initialized = true;
    this.cookieConsentService.consentStatus$.pipe(first((status) => status === 'granted' || true)).subscribe(() => this.afterIdle(() => this.initAdapters()));
  }

  track(name: string, properties: AnalyticsProperties = {}, options: TrackOptions = {}): void {
    if (!this.isEnabled() || this.cookieConsentService.getStatus() !== 'granted') return;

    const enriched = {
      tenant: this.config.tenant,
      ...properties,
    };

    const sendGa4 = options.ga4 ?? GA4_EVENTS.has(name);
    const sendPosthog = options.posthog ?? true;
    const needsGa4 = sendGa4 && !!this.config.ga4MeasurementId;
    const needsPosthog = sendPosthog && !!this.config.posthogKey;

    if ((needsGa4 && !this.ga4Initialized) || (needsPosthog && !this.posthogInitialized)) {
      this.enqueue({ name, properties: enriched, sendGa4, sendPosthog });
      return;
    }

    if (sendGa4) {
      this.trackGa4(name, enriched);
    }

    if (sendPosthog) {
      this.trackPostHog(name, enriched);
    }
  }

  trackProductViewed(product: ProductDto): void {
    this.track('view_item', {
      currency: 'EUR',
      value: product.cheapestPrice,
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.categoryName,
      items: [this.toGa4Item(product)],
    });
  }

  trackProductListViewed(filters: AnalyticsProperties, products: ProductSimpleDto[]): void {
    this.track('view_item_list', {
      item_list_name: this.getListName(filters),
      result_count: products.length,
      ...filters,
      items: products.slice(0, 20).map((product, index) => this.toGa4Item(product, index)),
    });
  }

  trackSearch(searchTerm: string, resultCount?: number): void {
    if (!searchTerm.trim()) return;

    this.track('search', {
      search_term: searchTerm.trim(),
      result_count: resultCount,
    });
  }

  trackAddToCart(data: { productId: number; variantId: number; productName: string; quantity: number; unitPrice: number; mergedIntoExisting: boolean; selectedOptionsCount: number }): void {
    this.track('add_to_cart', {
      currency: 'EUR',
      value: data.unitPrice * data.quantity,
      item_id: String(data.productId),
      item_name: data.productName,
      variant_id: String(data.variantId),
      quantity: data.quantity,
      merged_into_existing: data.mergedIntoExisting,
      selected_options_count: data.selectedOptionsCount,
      items: [
        {
          item_id: String(data.productId),
          item_name: data.productName,
          item_variant: String(data.variantId),
          price: data.unitPrice,
          quantity: data.quantity,
        },
      ],
    });
  }

  trackRemoveFromCart(item?: CartItemDto): void {
    if (!item) return;

    this.track('remove_from_cart', {
      currency: 'EUR',
      value: item.unitPrice * item.quantity,
      item_id: String(item.productId),
      item_name: item.productName,
      variant_id: String(item.variantId),
      quantity: item.quantity,
      items: [
        {
          item_id: String(item.productId),
          item_name: item.productName,
          item_variant: String(item.variantId),
          price: item.unitPrice,
          quantity: item.quantity,
        },
      ],
    });
  }

  trackCartViewed(items: CartItemDto[]): void {
    this.track('view_cart', {
      currency: 'EUR',
      value: this.cartValue(items),
      items: items.map((item) => this.toCartGa4Item(item)),
    });
  }

  trackCheckoutStarted(items: CartItemDto[]): void {
    this.track('begin_checkout', {
      currency: 'EUR',
      value: this.cartValue(items),
      item_count: items.reduce((total, item) => total + item.quantity, 0),
      items: items.map((item) => this.toCartGa4Item(item)),
    });
  }

  trackPaymentStarted(orderId: number, currency: string): void {
    this.track('add_payment_info', {
      order_id: String(orderId),
      currency,
    });
  }

  trackPaymentFailed(reason: string, orderId?: number): void {
    this.track(
      'payment_failed',
      {
        order_id: orderId ? String(orderId) : undefined,
        reason,
      },
      { ga4: false, posthog: true },
    );
  }

  trackOrderCompleted(data: { orderId?: number; orderNumber?: string; amountTotal?: number; currency?: string }): void {
    this.track('purchase', {
      transaction_id: data.orderNumber || (data.orderId ? String(data.orderId) : undefined),
      value: data.amountTotal ? data.amountTotal / 100 : undefined,
      currency: (data.currency || 'EUR').toUpperCase(),
    });
  }

  trackAddToCartBlocked(productId: number, reason: string): void {
    this.track(
      'add_to_cart_blocked',
      {
        product_id: String(productId),
        reason,
      },
      { ga4: false, posthog: true },
    );
  }

  trackCustomUpload(name: 'custom_upload_rejected' | 'custom_upload_selected' | 'custom_upload_success', props: AnalyticsProperties): void {
    this.track(name, props, { ga4: false, posthog: true });
  }

  private initAdapters(): void {
    this.initGa4('granted');
    this.startPageViewTracking();
    void this.initPostHog().finally(() => this.flushQueue());
  }

  private initGa4(consent: 'denied' | 'granted'): void {
    const measurementId = this.config.ga4MeasurementId;
    if (!measurementId) return;

    if (this.ga4Initialized) {
      this.updateGa4Consent(consent);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    this.updateGa4Consent(consent);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });
    this.ga4Initialized = true;
  }

  private updateGa4Consent(consent: 'denied' | 'granted'): void {
    if (typeof window.gtag !== 'function') return;

    window.gtag('consent', this.ga4Initialized ? 'update' : 'default', {
      ad_personalization: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      analytics_storage: consent,
    });
  }

  private async initPostHog(): Promise<void> {
    const key = this.config.posthogKey;
    if (!key || this.posthogInitialized) return;

    const module = await import('posthog-js');
    const posthog = module.default;
    posthog.init(key, {
      api_host: this.config.posthogHost || 'https://eu.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      persistence: 'localStorage+cookie',
      loaded: (client) => {
        if (this.config.tenant) {
          client.register({ tenant: this.config.tenant });
        }
      },
    });

    this.posthog = posthog;
    this.posthogInitialized = true;
  }

  private trackGa4(name: string, properties: AnalyticsProperties): void {
    if (!this.ga4Initialized || typeof window.gtag !== 'function') return;
    window.gtag('event', name, properties);
  }

  private startPageViewTracking(): void {
    if (this.pageViewsStarted) return;
    this.pageViewsStarted = true;

    this.trackPageView(this.router.url);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => this.trackPageView(event.urlAfterRedirects));
  }

  private trackPageView(url: string): void {
    this.trackGa4('page_view', {
      tenant: this.config.tenant,
      page_path: this.sanitizePath(url),
      page_title: document.title,
    });
  }

  private trackPostHog(name: string, properties: AnalyticsProperties): void {
    if (!this.posthogInitialized || !this.posthog) return;
    this.posthog.capture(name, properties);
  }

  private enqueue(event: QueuedEvent): void {
    if (this.queue.length >= 50) {
      this.queue.shift();
    }
    this.queue.push(event);
  }

  private flushQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (!event) return;

      if (event.sendGa4) {
        this.trackGa4(event.name, event.properties);
      }

      if (event.sendPosthog) {
        this.trackPostHog(event.name, event.properties);
      }
    }
  }

  private isEnabled(): boolean {
    return isPlatformBrowser(this.platformId) && this.config.enabled === true;
  }

  private afterIdle(callback: () => void): void {
    const idleCallback = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;

    if (idleCallback) {
      idleCallback(callback, { timeout: 2500 });
      return;
    }

    window.setTimeout(callback, 1000);
  }

  private cartValue(items: CartItemDto[]): number {
    return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }

  private sanitizePath(url: string): string {
    try {
      return new URL(url, window.location.origin).pathname;
    } catch {
      return url.split('?')[0].split('#')[0];
    }
  }

  private toCartGa4Item(item: CartItemDto): AnalyticsProperties {
    return {
      item_id: String(item.productId),
      item_name: item.productName,
      item_variant: String(item.variantId),
      price: item.unitPrice,
      quantity: item.quantity,
    };
  }

  private toGa4Item(product: ProductDto | ProductSimpleDto, index?: number): AnalyticsProperties {
    return {
      item_id: String(product.id),
      item_name: product.name,
      item_category: 'categoryName' in product ? product.categoryName : undefined,
      price: product.cheapestPrice,
      index,
    };
  }

  private getListName(filters: AnalyticsProperties): string {
    return (filters['category_name'] as string | undefined) || (filters['attribute_name'] as string | undefined) || (filters['search_term'] as string | undefined) || 'products';
  }
}
