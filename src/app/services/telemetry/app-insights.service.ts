import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApplicationInsights,
  DistributedTracingModes,
} from '@microsoft/applicationinsights-web';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { environment } from '../../../environments/environment';
import { CookieConsentService } from '../consent/cookie-consent.service';

export type TelemetryProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

@Injectable({
  providedIn: 'root',
})
export class AppInsightsService {
  private readonly angularPlugin = new AngularPlugin();
  private appInsights?: ApplicationInsights;
  private initialized = false;
  private initSubscribed = false;

  constructor(
    private readonly injector: Injector,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly cookieConsentService: CookieConsentService,
  ) {}

  init(): void {
    if (this.initialized) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const connectionString = environment.appInsightsConnectionString;
    if (!connectionString) return;

    if (this.initSubscribed) return;
    this.initSubscribed = true;

    const router = this.injector.get(Router);

    this.appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableAutoRouteTracking: true,
        autoTrackPageVisitTime: true,
        enableCorsCorrelation: true,
        distributedTracingMode: DistributedTracingModes.W3C,
        extensions: [this.angularPlugin],
        extensionConfig: {
          [this.angularPlugin.identifier]: {
            router: router,
          },
        },
      },
    });

    this.cookieConsentService.consentStatus$.subscribe((status) => {
      if (status !== 'granted') return;
      if (this.initialized) return;

      this.appInsights?.loadAppInsights();
      this.appInsights?.trackPageView();
      this.initialized = true;
    });
  }

  trackEvent(name: string, properties?: TelemetryProperties): void {
    if (!this.initialized || !this.appInsights) return;
    this.appInsights.trackEvent({ name }, properties);
  }

  trackException(error: unknown, properties?: TelemetryProperties): void {
    if (!this.initialized || !this.appInsights) return;

    const exception =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : 'Unknown error');

    this.appInsights.trackException({ exception }, properties);
  }
}
