import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  inject,
  PLATFORM_ID,
  REQUEST,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { APP_BASE_HREF, isPlatformServer, PlatformLocation } from '@angular/common';
import { languageOfPath } from './services/i18n/languages';

import { routes } from './app.routes';
import { AuthenticationInterceptor } from './interceptors/authentication.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { AuthenticationService } from './services/authentication/authentication.service';

/**
 * App initializer that checks auth state on startup.
 * This ensures the session is validated before the app renders.
 */
function initializeAuth(authService: AuthenticationService) {
  return () => authService.checkAuthState();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthenticationInterceptor, ErrorInterceptor]),
    ),
    // Server-rendered pages are taken over in place; data fetched on the server is reused for that first render
    // Product searches are POSTs, so they are cached too
    provideClientHydration(withEventReplay(), withHttpTransferCacheOptions({ includePostRequests: true })),
    // The app runs under its language (/en or /nl), so every route and link stays language-free.
    // At build time the server reads the routes without a request, and so without a language.
    {
      provide: APP_BASE_HREF,
      useFactory: () =>
        isPlatformServer(inject(PLATFORM_ID)) && !inject(REQUEST, { optional: true }) ? '/' : `/${languageOfPath(inject(PlatformLocation).pathname)}`,
    },
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      }),
    ),
    // Initialize auth state on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthenticationService],
      multi: true,
    },
  ],
};
