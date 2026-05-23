import { createReducer, on } from '@ngrx/store';
import {
AuthActions
} from './auth.action';
import { initialAuthState } from './auth.initial-state';

export const authReducer = createReducer(
  initialAuthState,

  // LOGIN
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { token, username }) => {
    localStorage.setItem('todo_token', token);
    localStorage.setItem('username', username);
    return {
      ...state,
      loading: false,
      token,
      username,
    };
  }),

  on(AuthActions.logout, () => ({
    ...initialAuthState,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // REGISTER
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.registerSuccess, (state) => ({
    ...state,
    loading: false,
    mode: 'login',
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  // AUTH MODE
  on(AuthActions.setMode, (state, { mode }) => ({
    ...state,
    mode,
  })),
);
