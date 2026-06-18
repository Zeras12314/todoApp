import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthActions } from '../store/auth/auth.action';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint =
        req.url.includes('/auth/me') ||
        req.url.includes('/login') ||
        req.url.includes('/logout');

      if (error.status === 401 && !isAuthEndpoint) {
        // session expired mid-use
        store.dispatch(AuthActions.logout());
      }
      return throwError(() => error);
    }),
  );
};