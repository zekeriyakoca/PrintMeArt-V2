import { provideRouter } from '@angular/router';
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthenticationInterceptor } from './interceptors/authentication.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { AuthenticationService } from './services/authentication/authentication.service';

/**
 * App initializer that checks auth state on startup.
 * This ensures the session is validated before the app renders.
 */
function initializeAuth(authService: AuthenticationService) {
  return () => authService.checkAuthState().toPromise();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthenticationInterceptor, ErrorInterceptor]),
    ),
    provideRouter(routes),
    // Initialize auth state on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthenticationService],
      multi: true,
    },
  ],
};
