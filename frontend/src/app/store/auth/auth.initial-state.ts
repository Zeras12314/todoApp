import { AuthState } from "./auth.model";


export const initialAuthState: AuthState = {
  token: null,
  loading: false,
  error: null,
  mode: 'signup'
};