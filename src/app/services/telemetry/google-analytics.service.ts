import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CookieConsentService } from '../consent/cookie-consent.service';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  private readonly GA_ID = 'G-1LMLTH4RW1';
  private initialized = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cookieConsentService: CookieConsentService,
  ) {}

  public init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.initialized) return;

    this.cookieConsentService.consentStatus$.subscribe((status) => {
      if (status === 'granted' && !this.initialized) {
        this.injectScript();
        this.initialized = true;
      }
    });
  }

  private injectScript(): void {
    // Create the script element for GTM
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.GA_ID);

    // The conversion event from index.html
    // Note: Usually conversion events are for specific actions, but preserving existing behavior
    window.gtag('event', 'conversion', {
      send_to: 'AW-789184874/Gl4DCPKTj80ZEOqCqPgC',
      value: 1.0,
      currency: 'TRY',
      transaction_id: '',
    });
  }
}
