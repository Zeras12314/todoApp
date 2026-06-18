import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthMode } from './auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Session check (app init / oauth2 callback)
    'Check Auth': emptyProps(),
    'Check Auth Success': props<{ username: string }>(),
    'Check Auth Failure': emptyProps(),

    // Login
    'Login': props<{ username: string; password: string }>(),
    'Login Success': props<{ message: string; username: string }>(),
    'Login Failure': props<{ error: string }>(),

    // Register (unchanged)
    'Register': props<{ username: string; password: string }>(),
    'Register Success': props<{ message: string }>(),
    'Register Failure': props<{
      error: string;
      field?: 'username' | 'password' | 'email' | null;
      code?: string;
    }>(),

    'Set Mode': props<{ mode: AuthMode }>(),

    // Logout
    'Logout': emptyProps(),
    'Logout Complete': emptyProps(),
  },
});