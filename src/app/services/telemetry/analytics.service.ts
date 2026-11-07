import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, fromEvent, interval, map, merge, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItemDto, SelectedOptionDto } from '../../models/cart-item';
import { OrderItemDto } from '../../models/orders';
import { ProductDto, ProductSimpleDto } from '../../models/product';
import { AuthenticationService } from '../authentication/authentication.service';

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

type FirstPartyEventRequest = {
  clientEventId: string;
  userId?: string;
  anonymousId?: string;
  sessionId?: string;
  eventName: string;
  occurredAt: string;
  source: 'storefront';
  propertiesJson: string;
};

const GA4_EVENTS = new Set(['view_item_list', 'view_item', 'search', 'add_to_cart', 'remove_from_cart', 'view_cart', 'begin_checkout', 'add_payment_info', 'purchase']);
const FIRST_PARTY_EVENTS = new Set([
  'view_item',
  'search',
  'add_to_cart',
  'view_cart',
  'begin_checkout',
  'add_payment_info',
  'payment_failed',
  'purchase',
  'custom_upload_rejected',
  'custom_upload_selected',
  'custom_upload_success',
]);
const FIRST_PARTY_BATCH_SIZE = 20;
const FIRST_PARTY_MAX_QUEUE_SIZE = 200;
const FIRST_PARTY_FLUSH_INTERVAL_MS = 5000;
const KEEPALIVE_MAX_BYTES = 60 * 1024;
const PAGE_TITLE_WAIT_MS = 3000;
const TRACKED_ORDERS_KEY = 'pma_tracked_orders';
const CHECKOUT_ITEMS_KEY = 'pma_checkout_items';
/** Options kept out of the variant name: internal links of custom designs and previews */
const UNTRACKED_OPTIONS = ['CustomProductUrl', 'PreviewSnapshotUrl'];

/** The choices made on the product page, sent with add_to_cart */
export type ProductChoices = { size?: string; paper?: string; frame?: string; mat?: string };

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private initialized = false;
  private ga4Initialized = false;
  private posthogInitialized = false;
  private pageViewsStarted = false;
  private pendingPageView?: () => void;
  private currentUserId?: string;
  private posthog?: {
    capture: (name: string, props?: AnalyticsProperties) => void;
    identify: (id: string, props?: AnalyticsProperties) => void;
    reset: () => void;
    startSessionRecording: () => void;
    stopSessionRecording: () => void;
  };
  private sessionRecordingStarted = false;
  private readonly queue: QueuedEvent[] = [];
  private readonly firstPartyQueue: FirstPartyEventRequest[] = [];
  private readonly firstPartyFlushRequests$ = new Subject<boolean>();
  private firstPartyFlushInFlight = false;
  private anonymousId?: string;
  private sessionId?: string;

  private readonly config: AnalyticsConfig = (environment as { analytics?: AnalyticsConfig }).analytics ?? {};
  private readonly analyticsApiUrl = (environment as { serviceUrls?: Record<string, string> }).serviceUrls?.['analytics-api'];

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly router: Router,
    private readonly authService: AuthenticationService,
  ) {}

  init(): void {
    if (this.initialized || !this.isEnabled()) return;
    this.initialized = true;

    this.authService.getAuthState().subscribe((state) => {
      this.currentUserId = state.user?.id;
      this.applyUserId();
    });

    this.initFirstPartyTracking();
    this.afterIdle(() => this.initAdapters());
  }

  track(name: string, properties: AnalyticsProperties = {}, options: TrackOptions = {}): void {
    if (!this.isEnabled()) return;

    const enriched = this.enrich(properties);
    const sendGa4 = options.ga4 ?? GA4_EVENTS.has(name);
    const sendPosthog = options.posthog ?? true;
    const needsGa4 = sendGa4 && !!this.config.ga4MeasurementId;
    const needsPosthog = sendPosthog && !!this.config.posthogKey;

    if (FIRST_PARTY_EVENTS.has(name)) {
      this.enqueueFirstParty(name, enriched);
    }

    if (!needsGa4 && !needsPosthog) return;

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
      value: this.money(product.cheapestPrice),
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

  trackAddToCart(data: {
    productId: number;
    variantId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    mergedIntoExisting: boolean;
    selectedOptions: SelectedOptionDto[];
    choices?: ProductChoices;
  }): void {
    this.track('add_to_cart', {
      currency: 'EUR',
      value: this.money(data.unitPrice * data.quantity),
      item_id: String(data.productId),
      item_name: data.productName,
      variant_id: String(data.variantId),
      quantity: data.quantity,
      merged_into_existing: data.mergedIntoExisting,
      selected_options_count: data.selectedOptions?.length ?? 0,
      ...data.choices,
      items: [
        {
          item_id: String(data.productId),
          item_name: data.productName,
          item_variant: this.variantName(data.selectedOptions),
          price: this.money(data.unitPrice),
          quantity: data.quantity,
        },
      ],
    });
  }

  trackRemoveFromCart(item?: CartItemDto, quantity = item?.quantity ?? 0): void {
    if (!item) return;
    this.trackCartChange('remove_from_cart', item, quantity);
  }

  /** A quantity changed with the + and - buttons in the cart */
  trackCartQuantityChanged(item: CartItemDto, delta: number): void {
    if (delta === 0) return;
    this.trackCartChange(delta > 0 ? 'add_to_cart' : 'remove_from_cart', item, Math.abs(delta));
  }

  private trackCartChange(name: 'add_to_cart' | 'remove_from_cart', item: CartItemDto, quantity: number): void {
    this.track(name, {
      currency: 'EUR',
      value: this.money(item.unitPrice * quantity),
      item_id: String(item.productId),
      item_name: item.productName,
      variant_id: String(item.variantId),
      quantity,
      items: [{ ...this.toCartGa4Item(item), quantity }],
    });
  }

  trackCartViewed(items: CartItemDto[]): void {
    if (items.length === 0) return;

    this.track('view_cart', {
      currency: 'EUR',
      value: this.cartValue(items),
      item_count: items.reduce((total, item) => total + item.quantity, 0),
      items: items.map((item) => this.toCartGa4Item(item)),
    });
  }

  trackCheckoutStarted(items: CartItemDto[]): void {
    if (items.length === 0) return;

    this.track('begin_checkout', {
      currency: 'EUR',
      value: this.cartValue(items),
      item_count: items.reduce((total, item) => total + item.quantity, 0),
      items: items.map((item) => this.toCartGa4Item(item)),
    });
  }

  trackPaymentStarted(orderId: number, currency: string, items: CartItemDto[]): void {
    this.track('add_payment_info', {
      order_id: String(orderId),
      currency,
      value: this.cartValue(items),
      items: items.map((item) => this.toCartGa4Item(item)),
    });
    this.rememberCheckoutItems(orderId, items);
  }

  // Kept for the success page after Stripe, where the cart is already gone
  private rememberCheckoutItems(orderId: number, items: CartItemDto[]): void {
    try {
      sessionStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify({ orderId, items: items.map((item) => this.toCartGa4Item(item)) }));
    } catch {
      // Storage unavailable: the purchase goes without items
    }
  }

  /** The items of an order paid in this tab, as sent with add_payment_info */
  checkoutItems(orderId?: number): AnalyticsProperties[] | undefined {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CHECKOUT_ITEMS_KEY) || 'null') as { orderId: number; items: AnalyticsProperties[] } | null;
      return saved && saved.orderId === orderId ? saved.items : undefined;
    } catch {
      return undefined;
    }
  }

  orderItems(items: OrderItemDto[]): AnalyticsProperties[] {
    return items.map((item) => ({
      item_id: String(item.productId),
      item_name: item.productName,
      item_variant: this.variantName(item.selectedOptions),
      price: this.money(item.unitPrice),
      quantity: item.units,
    }));
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

  trackOrderCompleted(data: { orderId?: number; orderNumber?: string; amountTotal?: number; currency?: string; items?: AnalyticsProperties[]; shipping?: number }): void {
    const transactionId = data.orderNumber || (data.orderId ? String(data.orderId) : undefined);
    // The success page can be opened again (reload, back button); an order counts once
    if (transactionId && !this.markOrderTracked(transactionId)) return;

    this.track('purchase', {
      transaction_id: transactionId,
      value: data.amountTotal ? data.amountTotal / 100 : undefined,
      currency: (data.currency || 'EUR').toUpperCase(),
      shipping: data.shipping,
      items: data.items,
    });
    try {
      sessionStorage.removeItem(CHECKOUT_ITEMS_KEY);
    } catch {
      // Nothing to clean up
    }
  }

  /** False when this order was already tracked in this browser */
  private markOrderTracked(transactionId: string): boolean {
    try {
      const tracked: string[] = JSON.parse(localStorage.getItem(TRACKED_ORDERS_KEY) || '[]');
      if (tracked.includes(transactionId)) return false;
      localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify([...tracked, transactionId].slice(-20)));
    } catch {
      // Storage unavailable: track it anyway
    }
    return true;
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
    this.initGa4();
    this.startPageViewTracking();
    void this.initPostHog().finally(() => this.flushQueue());
  }

  private initGa4(): void {
    const measurementId = this.config.ga4MeasurementId;
    if (!measurementId || this.ga4Initialized) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('consent', 'default', {
      ad_personalization: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      analytics_storage: 'granted',
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false,
      user_id: this.currentUserId,
    });

    this.ga4Initialized = true;
    this.applyUserId();
  }

  private applyUserId(): void {
    if (!this.ga4Initialized || typeof window.gtag !== 'function') return;

    window.gtag('set', {
      user_id: this.currentUserId,
      app_user_id: this.currentUserId,
    });

    if (this.currentUserId && this.posthogInitialized && this.posthog) {
      this.posthog.identify(this.currentUserId, {
        app_user_id: this.currentUserId,
        tenant: this.config.tenant,
      });
    } else if (this.posthogInitialized && this.posthog) {
      this.posthog.reset();
    }
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
    this.applyUserId();
    this.maybeStartSessionRecording(this.router.url);
  }

  private trackGa4(name: string, properties: AnalyticsProperties): void {
    if (!this.ga4Initialized || typeof window.gtag !== 'function') return;
    window.gtag('event', name, properties);
  }

  private trackPostHog(name: string, properties: AnalyticsProperties): void {
    if (!this.posthogInitialized || !this.posthog) return;
    this.posthog.capture(name, properties);
  }

  private initFirstPartyTracking(): void {
    if (!this.analyticsApiUrl) return;

    this.anonymousId = this.getOrCreateBrowserId('pma_anonymous_id', localStorage);
    this.sessionId = this.getOrCreateBrowserId('pma_session_id', sessionStorage);

    merge(
      interval(FIRST_PARTY_FLUSH_INTERVAL_MS).pipe(map(() => false)),
      this.firstPartyFlushRequests$,
      fromEvent(window, 'pagehide').pipe(map(() => true)),
      fromEvent(document, 'visibilitychange').pipe(
        filter(() => document.visibilityState === 'hidden'),
        map(() => true),
      ),
    ).subscribe((useBeacon) => this.flushFirstParty(useBeacon));
  }

  private enqueueFirstParty(name: string, properties: AnalyticsProperties): void {
    if (!this.analyticsApiUrl || !this.anonymousId || !this.sessionId) return;

    if (this.firstPartyQueue.length >= FIRST_PARTY_MAX_QUEUE_SIZE) {
      this.firstPartyQueue.shift();
    }

    this.firstPartyQueue.push({
      clientEventId: this.createId(),
      userId: this.currentUserId,
      anonymousId: this.anonymousId,
      sessionId: this.sessionId,
      eventName: name,
      occurredAt: new Date().toISOString(),
      source: 'storefront',
      propertiesJson: JSON.stringify(this.removeUndefined(properties)),
    });

    if (this.firstPartyQueue.length >= FIRST_PARTY_BATCH_SIZE) {
      this.firstPartyFlushRequests$.next(false);
    }
  }

  private flushFirstParty(useBeacon = false): void {
    if (!this.analyticsApiUrl || this.firstPartyFlushInFlight || this.firstPartyQueue.length === 0) return;

    const batch = this.firstPartyQueue.splice(0, FIRST_PARTY_BATCH_SIZE);
    const body = JSON.stringify(batch);
    const url = `${this.analyticsApiUrl}/analytics/v1/events/batch`;

    if (useBeacon && navigator.sendBeacon) {
      const sent = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      if (!sent) {
        this.firstPartyQueue.unshift(...batch);
      }
      return;
    }

    this.firstPartyFlushInFlight = true;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      credentials: 'include',
      keepalive: body.length <= KEEPALIVE_MAX_BYTES,
    })
      .catch(() => {
        this.firstPartyQueue.unshift(...batch);
        if (this.firstPartyQueue.length > FIRST_PARTY_MAX_QUEUE_SIZE) {
          this.firstPartyQueue.splice(0, this.firstPartyQueue.length - FIRST_PARTY_MAX_QUEUE_SIZE);
        }
      })
      .finally(() => {
        this.firstPartyFlushInFlight = false;
      });
  }

  private startPageViewTracking(): void {
    if (this.pageViewsStarted) return;
    this.pageViewsStarted = true;

    this.trackPageView(this.currentPageUrl());
    this.maybeStartSessionRecording(this.router.url);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.flushPendingPageView();
      if (this.hasRouteTitle()) {
        this.trackPageView(this.currentPageUrl());
      } else {
        this.trackPageViewOnceTitled(this.currentPageUrl());
      }
      this.maybeStartSessionRecording(event.urlAfterRedirects);
    });
    fromEvent(window, 'pagehide').subscribe(() => this.flushPendingPageView());
  }

  // Pages with seo route data get their title on navigation; product and catalog pages set it once their data arrives
  private hasRouteTitle(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return !!route.data['seo'];
  }

  private trackPageViewOnceTitled(pageUrl: URL): void {
    const titleElement = document.querySelector('title');
    const observer = titleElement ? new MutationObserver(() => this.flushPendingPageView()) : undefined;
    observer?.observe(titleElement!, { childList: true, characterData: true, subtree: true });
    const timeout = window.setTimeout(() => this.flushPendingPageView(), PAGE_TITLE_WAIT_MS);

    this.pendingPageView = () => {
      observer?.disconnect();
      window.clearTimeout(timeout);
      this.trackPageView(pageUrl);
    };
  }

  private flushPendingPageView(): void {
    const pending = this.pendingPageView;
    this.pendingPageView = undefined;
    pending?.();
  }

  private maybeStartSessionRecording(url: string): void {
    if (this.sessionRecordingStarted || !this.posthogInitialized || !this.posthog) return;
    const path = this.sanitizePath(url);
    if (path === '/' || path === '') return;

    this.posthog.startSessionRecording();
    this.sessionRecordingStarted = true;
  }

  // The address as the visitor sees it: language prefix, filters and campaign tags (utm, gclid) kept, Stripe's session_id left out
  private currentPageUrl(): URL {
    const url = new URL(window.location.href);
    // Only rewrite the query when needed, so it keeps the browser's own encoding (%20, not +)
    if (url.searchParams.has('session_id')) url.searchParams.delete('session_id');
    url.hash = '';
    return url;
  }

  private trackPageView(pageUrl: URL): void {
    const properties = this.enrich({
      page_path: pageUrl.pathname,
      page_location: pageUrl.href,
      page_title: document.title,
    });

    this.track('page_view', properties, { ga4: true, posthog: false });

    // PostHog Web analytics only reads $pageview
    this.track('$pageview', { ...properties, $current_url: pageUrl.href }, { ga4: false, posthog: true });
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

  private enrich(properties: AnalyticsProperties): AnalyticsProperties {
    return {
      tenant: this.config.tenant,
      app_user_id: this.currentUserId,
      ...properties,
    };
  }

  private isEnabled(): boolean {
    return isPlatformBrowser(this.platformId) && this.config.enabled === true && this.isLiveHost();
  }

  // Only the live site sends analytics, so local runs of a production build stay out of the data
  private isLiveHost(): boolean {
    const siteUrl = (environment as { siteUrl?: string }).siteUrl;
    if (!siteUrl) return false;

    try {
      return window.location.hostname === new URL(siteUrl).hostname;
    } catch {
      return false;
    }
  }

  // Third-party tags start only after the page has loaded, so they never compete with it
  private afterIdle(callback: () => void): void {
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => this.afterIdle(callback), { once: true });
      return;
    }

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

  private getOrCreateBrowserId(key: string, storage: Storage): string {
    try {
      const existing = storage.getItem(key);
      if (existing) return existing;

      const created = this.createId();
      storage.setItem(key, created);
      return created;
    } catch {
      return this.createId();
    }
  }

  private createId(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private removeUndefined(value: AnalyticsValue): AnalyticsValue {
    if (Array.isArray(value)) {
      return value.map((item) => this.removeUndefined(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, item]) => item !== undefined)
          .map(([key, item]) => [key, this.removeUndefined(item)]),
      );
    }

    return value;
  }

  private cartValue(items: CartItemDto[]): number {
    return this.money(items.reduce((total, item) => total + item.unitPrice * item.quantity, 0));
  }

  private money(amount: number): number {
    return Math.round(amount * 100) / 100;
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
      item_variant: this.variantName(item.selectedOptions),
      price: this.money(item.unitPrice),
      quantity: item.quantity,
    };
  }

  /** The chosen options as the cart shows them, e.g. "Natural Oak / Museum / No Mat / 30x40" */
  private variantName(options: SelectedOptionDto[] | undefined): string | undefined {
    const names = (options ?? []).map((option) => option.optionName).filter((name): name is string => !!name && !UNTRACKED_OPTIONS.includes(name));
    return names.length ? names.join(' / ') : undefined;
  }

  private toGa4Item(product: ProductDto | ProductSimpleDto, index?: number): AnalyticsProperties {
    return {
      item_id: String(product.id),
      item_name: product.name,
      item_category: 'categoryName' in product ? product.categoryName : undefined,
      price: this.money(product.cheapestPrice),
      index,
    };
  }

  private getListName(filters: AnalyticsProperties): string {
    return (filters['category_name'] as string | undefined) || (filters['attribute_name'] as string | undefined) || (filters['search_term'] as string | undefined) || 'products';
  }
}
