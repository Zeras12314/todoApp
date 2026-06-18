import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthMode, AuthState } from './auth.model';

export const selectAuth = createFeatureSelector<AuthState>('auth');

export const selectAuthStatus = createSelector(selectAuth, (s) => s.status);
export const selectAuthChecked = createSelector(selectAuthStatus, (status) => status !== 'unknown');
export const selectIsAuthenticated = createSelector(selectAuthStatus, (status) => status === 'authenticated');

export const selectUser = createSelector(selectAuth, (s) => s.username ?? '');
export const selectLoading = createSelector(selectAuth, (s) => s.loading);
export const selectError = createSelector(selectAuth, (s) => s.error);
export const selectAuthMode = createSelector(selectAuth, (s): AuthMode => s.mode);