import { CanActivateFn } from '@angular/router';

// Auth is optional: allow navigation even when unauthenticated.
// Token (if present) will be attached by the HTTP interceptor.
export const AuthenticationGuard: CanActivateFn = () => true;
