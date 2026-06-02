import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthMode } from './auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login
    'Login': props<{ username: string; password: string }>(),
    'Login Success': props<{
      token: string;
      message: string;
      username: string;
    }>(),
    'Login Failure': props<{ error: string }>(),

    // Register
    'Register': props<{ username: string; password: string }>(),
    'Register Success': props<{ message: string }>(),
    'Register Failure': props<{
      error: string;
      field?: 'username' | 'password' | 'email' | null;
      code?: string;
    }>(),

    // UI / State
    'Set Mode': props<{ mode: AuthMode }>(),

    // Logout
    'Logout': emptyProps(),
  },
});