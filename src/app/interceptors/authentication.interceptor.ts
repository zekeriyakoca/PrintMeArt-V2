import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

/**
 * BFF-style HTTP interceptor.
 * - Adds withCredentials: true for cookie authentication
 * - Adds session tracking headers
 * - Handles 401 responses by redirecting to login
 */
export const AuthenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const requestId = createRequestId();
  const sessionId = isBrowser ? getSessionIdBrowser() : requestId;

  // Build the full URL if not absolute
  const url =
    req.url.startsWith('http') || req.url.startsWith('www.')
      ? req.url
      : `${environment.apiUrl}${req.url}`;

  // Clone request with credentials and tracking headers
  const newReq = req.clone({
    url,
    withCredentials: true, // Send cookies with every request
    setHeaders: {
      'x-sessionid': sessionId,
      'x-requestid': requestId,
    },
  });

  return next(newReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Session expired or invalid - redirect to login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};

const SESSION_KEY = 'session_id';

function getSessionIdBrowser(): string {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = createRequestId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return createRequestId();
  }
}

function createRequestId(): string {
  const cryptoObj = (globalThis as any).crypto as Crypto | undefined;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();

  // RFC4122-ish v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
