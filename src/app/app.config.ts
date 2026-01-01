import { provideRouter } from '@angular/router';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthenticationInterceptor } from './interceptors/authentication.interceptor';
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SOCIAL_AUTH_CONFIG,
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthenticationInterceptor]),
    ),
    provideRouter(routes),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '761877359482-leqnq498c781apae0456om543bf70h4g.apps.googleusercontent.com',
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
};
