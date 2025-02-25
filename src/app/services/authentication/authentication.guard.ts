import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

export const AuthenticationGuard: CanActivateFn = (route, state): boolean => {
  // const authService = inject(AuthenticationService);

  // if (authService.isAuthenticated()) {
  //   return true;
  // } else {
  //   const router = inject(Router);
  //   router.navigate(['/login']);
  //   return false;
  // }

  return true; // Temporary change- remove this line and uncomment the above code to enable authentication.
};
