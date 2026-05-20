import { AuthState } from './auth.model';

export const initialAuthState: AuthState = {
  token: localStorage.getItem('todo_token') ?? null,
  username: localStorage.getItem('username') ?? '',
  loading: false,
  error: null,
  mode: 'signup',
};
