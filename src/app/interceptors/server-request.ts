import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, InjectionToken, REQUEST } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** The gateway inside the cluster, so the server does not go out through the public domain. */
export const INTERNAL_API_URL = new InjectionToken<string | null>('INTERNAL_API_URL', { factory: () => null });

export const PUBLIC_API_URL = new URL(environment.serviceUrls.bff).origin;

/**
 * Sends an API request made while rendering a page on the server, on behalf of the visitor: the API
 * knows the shop from the Origin, and the gateway's rate limit counts the visitor's IP, not the server's.
 */
export function serverRequest(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const internalApiUrl = inject(INTERNAL_API_URL);
  const visitorIp = inject(REQUEST, { optional: true })?.headers.get('x-forwarded-for');
  const url = internalApiUrl && req.url.startsWith(PUBLIC_API_URL) ? internalApiUrl + req.url.slice(PUBLIC_API_URL.length) : req.url;

  return next(
    req.clone({
      url,
      setHeaders: { Origin: environment.siteUrl, ...(visitorIp ? { 'X-Forwarded-For': visitorIp } : {}) },
    }),
  );
}
