export type AuthMode = 'login' | 'signup' | 'success';

export interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
  mode: AuthMode;
  username: string;
}
