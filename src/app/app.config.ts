import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideLanguageBase } from './services/i18n/language.service';
import { TranslationService } from './services/i18n/translation.service';
import { SeoService } from './services/seo/seo.service';

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
    provideLanguageBase(),
    provideAppInitializer(() => inject(TranslationService).load()),
    provideAppInitializer(() => inject(SeoService).init()),
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
