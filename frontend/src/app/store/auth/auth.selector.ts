import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthMode, AuthState } from './auth.model';

export const selectAuth = createFeatureSelector<AuthState>('auth');

export const selectToken = createSelector(selectAuth, (state) => state.token);

export const selectUser = createSelector(selectAuth, (state) => state.username ?? '');

export const selectLoading = createSelector(selectAuth, (state) => state.loading);

export const selectError = createSelector(selectAuth, (state) => state.error);

export const selectAuthMode = createSelector(selectAuth, (state): AuthMode => state.mode);

export const selectIsAuthenticated = createSelector(selectToken, (token) => !!token);
