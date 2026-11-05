import { HttpErrorResponse } from '@angular/common/http';

/** Field messages of a backend 400 validation problem (`errors`, keyed by the request's JSON path), or null for any other error */
export function validationErrors(error: unknown): Record<string, string[]> | null {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) return null;
  const errors = error.error?.errors;
  return errors && typeof errors === 'object' ? (errors as Record<string, string[]>) : null;
}
