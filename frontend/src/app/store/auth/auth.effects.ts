import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {AuthActions} from './auth.action';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  authService = inject(AuthService);
  actions$ = inject(Actions);
  toastService = inject(ToastService);
  router = inject(Router);

  // =========================
  // LOGIN
  // =========================
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),

      switchMap((action) =>
        this.authService.login(action.username, action.password).pipe(
          tap((res) => {
            console.log('LOGIN RESPONSE:', res);
          }),

          map((res: any) =>
            AuthActions.loginSuccess({
              token: res.token,
              message: res.message || 'Login successful',
              username: res.username,
            }),
          ),

          catchError((err) => {
            console.log('LOGIN ERROR:', err);

            return of(
              AuthActions.loginFailure({
                error: err.error?.error || err.error?.message || 'Login failed',
              }),
            );
          }),
        ),
      ),
    ),
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
          tap((res) => {
            console.log('REGISTER RESPONSE:', res);
          }),

          map((res: any) =>
            AuthActions.registerSuccess({
              message: res.message || 'Account successfully created',
            }),
          ),

          catchError((err) => {
            console.log('REGISTER ERROR:', err);

            return of(
              AuthActions.registerFailure({
                error: err.error?.error || err.error?.message || 'Register failed',
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

        tap(({ error }) => {
          this.toastService.error(error);
        }),
      ),
    { dispatch: false },
  );

  // LOGOUT
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('todo_token');
          localStorage.removeItem('username');
          window.location.href = '/login';
        }),
      ),
    { dispatch: false },
  );
}
