import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthActions } from '../store/auth/auth.action';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('todo_token');
  const store  = inject(Store);

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 0) {
        store.dispatch(AuthActions.logout());
      }
      return throwError(() => error);
    })
  );
};