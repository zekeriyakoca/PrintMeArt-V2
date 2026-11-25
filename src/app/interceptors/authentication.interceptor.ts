import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';
import { serverRequest } from './server-request';
import { currentPostHogSessionId } from '../services/telemetry/posthog-session';

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
  // PostHog's session id lets the backend logs of this visit be found from its recording (Seq: PostHogSessionId)
  const postHogSessionId = isBrowser ? currentPostHogSessionId() : undefined;

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
      ...(postHogSessionId ? { 'X-Correlation-ID': postHogSessionId } : {}),
    },
  });

  return (isBrowser ? next(newReq) : serverRequest(newReq, next)).pipe(
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

/**
 * The guest's id: the backend keys the guest basket and the guest buyer on it. It lives in localStorage so it
 * survives the trip to Stripe and back, and new tabs. In sessionStorage, mobile Safari sometimes lost it on the way
 * back, and the guest came back as a stranger with an empty basket.
 */
function getSessionIdBrowser(): string {
  try {
    // An id from before the move to localStorage is kept, so a basket filled just before a deploy is not lost
    let sessionId = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = createRequestId();
    }
    localStorage.setItem(SESSION_KEY, sessionId);
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
