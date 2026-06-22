import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthActions } from './auth.action';
import { catchError, filter, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  authService = inject(AuthService);
  actions$ = inject(Actions);
  toastService = inject(ToastService);
  router = inject(Router);


  // SESSION CHECK
  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      switchMap(() =>
        this.authService.me().pipe(
          map((res) => AuthActions.checkAuthSuccess({ username: res.username })),
          catchError(() => of(AuthActions.checkAuthFailure())),
        ),
      ),
    ),
  );

  // LOGIN — cookie is set by the browser automatically; we just read the username
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap((action) =>
        this.authService.login(action.username, action.password).pipe(
          map((res) =>
            AuthActions.loginSuccess({
              message: 'Login successful',
              username: res.username,
            }),
          ),
          catchError((err) =>
            of(AuthActions.loginFailure({
              error: err.error?.error || err.error?.message || 'Login failed',
            })),
          ),
        ),
      ),
    ),
  );

  // LOGOUT — tell the backend to clear the cookie, then reset locally.
  // The frontend cannot delete an httpOnly cookie itself.
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutComplete()),
          catchError(() => of(AuthActions.logoutComplete())), // clear local state regardless
        ),
      ),
    ),
  );

  logoutComplete$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutComplete),
        tap(() => this.router.navigate(['/login'])),
      ),
    { dispatch: false },
  );


  // LOGIN SUCCESS TOAST + MODE CHANGE
  loginSuccessToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),

        tap(({ message }) => {
          this.toastService.success(message);
          this.router.navigate(['/todos']);
        }),
      ),
    { dispatch: false },
  );

  loginFailureToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),

        tap(({ error }) => {
          this.toastService.error(error);
        }),
      ),
    { dispatch: false },
  );

  // =========================
  // REGISTER
  // =========================
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),

      switchMap((action) =>
        this.authService.register(action.username, action.password).pipe(
          map((res: any) =>
            AuthActions.registerSuccess({
              message: res.message || 'Account successfully created',
            }),
          ),

          catchError((err) => {
            const apiError = err.error;
            const rawMessage = apiError?.error || apiError?.message || 'Register failed';
            const errorMessage = typeof rawMessage === 'string' ? rawMessage : 'Register failed';

            // detect username conflict from the message
            const isUsernameTaken = errorMessage.toLowerCase().includes('username') ||
              err.status === 409;

            return of(
              AuthActions.registerFailure({
                error: errorMessage,
                field: isUsernameTaken ? 'username' : null,
                code: isUsernameTaken ? 'already_exists' : null,
              }),
            );
          }),
        ),
      ),
    ),
  );

  // REGISTER SUCCESS
  registerSuccessToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ message }) => {
        this.toastService.success(message);
      }),
      map(() => AuthActions.setMode({ mode: 'success' })), // dispatch mode change
    ),
  );

  registerFailureToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerFailure),
        filter(({ field }) => !field),

        tap(({ error }) => {
          this.toastService.error(error || 'Register failed');
        }),
      ),
    { dispatch: false },
  );

}
