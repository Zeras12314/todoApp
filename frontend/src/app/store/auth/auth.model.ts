export type AuthMode = 'login' | 'signup' | 'success';
export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  username: string;
  loading: boolean;
  error: string | null;
  mode: AuthMode;
}