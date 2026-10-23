import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { defer, Observable, retry, shareReplay, switchMap, throwError, timer } from 'rxjs';
import { environment } from '../../environments/environment';

// Stays under the gateway's limit of 300 requests a minute per client
const REQUEST_SPACING_MS = 250;
let nextRequestAt = 0;

// Shared by every page this build worker renders, so data that is the same on every page is fetched once
const sharedGets = new Map<string, Observable<HttpEvent<unknown>>>();

/**
 * Sends a request made while prerendering pages at build time. The API knows the shop from the Origin a
 * browser sends; requests are spaced out so the build does not trip the gateway's rate limit.
 */
export function prerenderRequest(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const request = defer(() => {
    const now = Date.now();
    nextRequestAt = Math.max(now, nextRequestAt) + REQUEST_SPACING_MS;
    return timer(nextRequestAt - REQUEST_SPACING_MS - now);
  }).pipe(
    switchMap(() => next(req.clone({ setHeaders: { Origin: environment.siteUrl } }))),
    retry({
      count: 3,
      delay: (error: HttpErrorResponse) => (error.status === 429 ? timer(5000) : throwError(() => error)),
    }),
  );
  if (req.method !== 'GET') return request;

  if (!sharedGets.has(req.urlWithParams)) sharedGets.set(req.urlWithParams, request.pipe(shareReplay(1)));
  return sharedGets.get(req.urlWithParams)!;
}
