import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { map } from 'rxjs';

/**
 * Route guard that checks BFF session authentication.
 * Redirects to login if not authenticated.
 */
export const AuthenticationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  // If we already know auth state and not loading, use it
  if (!authService.isLoading()) {
    if (authService.isAuthenticated()) {
      return true;
    }
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Otherwise check with server
  return authService.checkAuthState().pipe(
    map((authState) => {
      if (authState.isAuthenticated) {
        return true;
      }
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }),
  );
};
