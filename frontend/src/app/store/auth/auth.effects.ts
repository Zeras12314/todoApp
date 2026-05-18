import { inject, Injectable } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import {
  login,
  loginFailure,
  loginSuccess,
  register,
  registerFailure,
  registerSuccess,
  setAuthMode
} from "./auth.action";

import { catchError, map, mergeMap, of, tap } from "rxjs";
import { ToastService } from "../../services/toast.service";

@Injectable()
export class AuthEffects {

  authService = inject(AuthService);
  actions$ = inject(Actions);
  toastService = inject(ToastService);

  // =========================
  // LOGIN
  // =========================
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),

      mergeMap(action =>
        this.authService.login(action.username, action.password).pipe(

          tap((res) => {
            console.log('LOGIN RESPONSE:', res);
          }),

          map((res: any) =>
            loginSuccess({
              token: res.token,
              message: res.message || 'Login successful'
            })
          ),

          catchError(err => {
            console.log('LOGIN ERROR:', err);

            return of(
              loginFailure({
                error: err.error?.error || err.error?.message || 'Login failed'
              })
            );
          })
        )
      )
    )
  );

  // LOGIN SUCCESS TOAST + MODE CHANGE
  loginSuccessToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),

        tap(({ message }) => {
          this.toastService.success(message);

          // optional: move to app after login
          this.toastService.success('Login success');
        })
      ),
    { dispatch: false }
  );

  loginFailureToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginFailure),

        tap(({ error }) => {
          this.toastService.error(error);
        })
      ),
    { dispatch: false }
  );

  // =========================
  // REGISTER
  // =========================
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(register),

      mergeMap(action =>
        this.authService.register(action.username, action.password).pipe(

          tap((res) => {
            console.log('REGISTER RESPONSE:', res);
          }),

          map((res: any) =>
            registerSuccess({
              message: res.message || 'Account successfully created'
            })
          ),

          catchError(err => {
            console.log('REGISTER ERROR:', err);

            return of(
              registerFailure({
                error: err.error?.error || err.error?.message || 'Register failed'
              })
            );
          })
        )
      )
    )
  );

  // REGISTER SUCCESS
  registerSuccessToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(registerSuccess),

      tap(({ message }) => {
        this.toastService.success(message);
      }),

      map(() => setAuthMode({ mode: 'success' }))
    )
  );

  registerFailureToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(registerFailure),

        tap(({ error }) => {
          this.toastService.error(error);
        })
      ),
    { dispatch: false }
  );
}