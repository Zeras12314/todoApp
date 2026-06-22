import { createReducer, on } from '@ngrx/store';
import {
AuthActions
} from './auth.action';
import { initialAuthState } from './auth.initial-state';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.checkAuth, (state) => ({ ...state, status: 'unknown' as const })),

  // SESSION CHECK
  on(AuthActions.checkAuthSuccess, (state, { username }) => ({
    ...state,
    status: 'authenticated' as const,
    username,
  })),

  on(AuthActions.checkAuthFailure, (state) => ({
    ...state,
    status: 'unauthenticated' as const,
    username: '',
  })),

  // LOGIN
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { username }) => ({
    ...state,
    loading: false,
    status: 'authenticated' as const,
    username,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // LOGOUT — explicitly unauthenticated, not 'unknown'
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
  })),

  on(AuthActions.logoutComplete, () => ({
    ...initialAuthState,
    status: 'unauthenticated' as const,
  })),

  // REGISTER + SET MODE: unchanged from what you have
  on(AuthActions.register, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.registerSuccess, (state) => ({ ...state, loading: false, mode: 'login' as const })),
  on(AuthActions.registerFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.setMode, (state, { mode }) => ({ ...state, mode })),
);
