import { HttpInterceptorFn } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

export const AuthenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const authToken = (authService.getToken() || '').trim();

  const requestId = createRequestId();
  const sessionId = isBrowser ? getSessionIdBrowser() : requestId;

  let headers = req.headers
    .set('x-sessionid', sessionId)
    .set('x-requestid', requestId);

  if (authToken) {
    headers = headers.set('Authorization', authToken);
  }

  const newReq = req.clone({
    headers,
    url:
      req.url.startsWith('http') || req.url.startsWith('www.')
        ? req.url
        : `${environment.apiUrl}${req.url}`,
  });

  return next(newReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.warn('Unauthorized request detected. Handling 401...');
        authService.logout();
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
