import { AuthState } from './auth.model';

export const initialAuthState: AuthState = {
  status: 'unknown',
  username: '',
  loading: false,
  error: null,
  mode: 'login',
};