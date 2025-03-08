import { HttpInterceptorFn } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

export const AuthenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const authToken = authService.getToken() || '';
  const newReq = req.clone({
    headers: req.headers
      .set('Authorization', authToken)
      .set('x-sessionid', getSessionId())
      .set('x-requestid', crypto.randomUUID()),
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
    })
  );
};

const SESSION_KEY = 'session_id';

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}
