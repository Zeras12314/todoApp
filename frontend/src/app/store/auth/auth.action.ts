import { createAction, props } from '@ngrx/store';
import { AuthMode } from './auth.model';

export const login = createAction('[Auth] Login', props<{ username: string; password: string }>());

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{
    token: string;
    message: string;
    username: string;
  }>(),
);

export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const register = createAction(
  '[Auth] Register',
  props<{ username: string; password: string }>(),
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ message: string }>(),
);

export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

export const setAuthMode = createAction('[Auth] Set Mode', props<{ mode: AuthMode }>());

export const logout = createAction('[Auth] logout');
