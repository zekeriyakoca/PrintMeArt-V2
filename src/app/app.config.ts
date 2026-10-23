import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';

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
    // Prerendered pages are taken over in place; data fetched at build time is reused for that first render
    // Product searches are POSTs, so they are cached too
    provideClientHydration(withEventReplay(), withHttpTransferCacheOptions({ includePostRequests: true })),
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
