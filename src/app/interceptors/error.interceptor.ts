import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';

/** HTTP statuses the caller handles itself (e.g. a 404 that shows the not-found page), so no toast */
export const SILENT_STATUSES = new HttpContextToken<number[]>(() => []);

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      // The order endpoint answers 409 when the basket or its prices changed; checkout shows that itself
      if (error instanceof HttpErrorResponse && error.status === 409 && req.url.endsWith('/ordering/order')) {
        return throwError(() => error);
      }

      if (error instanceof HttpErrorResponse) {
        if (req.context.get(SILENT_STATUSES).includes(error.status)) {
          return throwError(() => error);
        }
        // Common cases we typically don't toast globally.
        // 401 is handled by `AuthenticationInterceptor` (logout flow).
        if (error.status !== 401) {
          const messages = extractBackendErrorMessages(error);
          const messageToShow = messages[0] ?? defaultMessageForStatus(error);
          toastService.error(messageToShow);
        } else {
          toastService.error('errors.unauthorized');
        }
      } else {
        toastService.error('errors.generic');
      }

      return throwError(() => error);
    }),
  );
};

function defaultMessageForStatus(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'errors.network';
  }

  if (error.status >= 500) {
    return 'errors.server';
  }

  if (error.status === 403) {
    return 'errors.forbidden';
  }

  if (error.status === 404) {
    return 'errors.notFound';
  }

  return 'Request failed. Please try again.';
}

function extractBackendErrorMessages(error: HttpErrorResponse): string[] {
  const body = error.error;

  // If backend returns plain text.
  if (typeof body === 'string') {
    const trimmed = body.trim();
    return trimmed ? [trimmed] : [];
  }

  // If backend returns JSON.
  if (body && typeof body === 'object') {
    const anyBody = body as any;

    // Common patterns: { message: string }
    if (typeof anyBody.message === 'string' && anyBody.message.trim()) {
      return [anyBody.message.trim()];
    }

    // { error: string | { message } | string[] }
    if (typeof anyBody.error === 'string' && anyBody.error.trim()) {
      return [anyBody.error.trim()];
    }

    // { errors: string[] }
    if (Array.isArray(anyBody.errors)) {
      const values = anyBody.errors
        .filter((v: unknown) => typeof v === 'string')
        .map((v: string) => v.trim())
        .filter(Boolean);

      if (values.length) return values;
    }

    // Validation modelstate-ish: { errors: { field: [msg] } }
    if (anyBody.errors && typeof anyBody.errors === 'object') {
      const collected: string[] = [];
      for (const value of Object.values(anyBody.errors)) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed) collected.push(trimmed);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string') {
              const trimmed = item.trim();
              if (trimmed) collected.push(trimmed);
            }
          }
        }
      }

      if (collected.length) return collected;
    }

    // Fallback: statusText / generic.
  }

  // If Angular couldn't parse the body (Blob, ArrayBuffer, etc.), fall back.
  const statusText = (error.statusText || '').trim();
  return statusText ? [statusText] : [];
}
