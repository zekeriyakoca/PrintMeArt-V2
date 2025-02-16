import { HttpInterceptorFn } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

export const AuthenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = inject(AuthenticationService).getToken();
  const newReq = req.clone({
    headers: req.headers
      .append('Authorization', authToken)
      .append('x-requestid', crypto.randomUUID()),
    url:
      req.url.startsWith('http') || req.url.startsWith('www.')
        ? req.url
        : `${environment.apiUrl}${req.url}`,
  });
  return next(newReq);
};
