import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // Common cases we typically don't toast globally.
        // 401 is handled by `AuthenticationInterceptor` (logout flow).
        if (error.status !== 401) {
          const messages = extractBackendErrorMessages(error);
          const messageToShow = messages[0] ?? defaultMessageForStatus(error);
          toastService.error(messageToShow);
        } else {
          toastService.error('Unauthorized access. Please log in again.');
        }
      } else {
        toastService.error('Something went wrong. Please try again.');
      }

      return throwError(() => error);
    }),
  );
};

function defaultMessageForStatus(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error.status >= 500) {
    return 'Server error. Please try again in a moment.';
  }

  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error.status === 404) {
    return 'Requested resource was not found.';
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
