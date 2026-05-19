import { createReducer, on } from "@ngrx/store";
import { login, loginFailure, loginSuccess, logout, register, registerFailure, registerSuccess, setAuthMode } from "./auth.action";
import { initialAuthState } from "./auth.initial-state";


export const authReducer = createReducer(
    initialAuthState,

    // LOGIN
    on(login, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(loginSuccess, (state, { token }) => {
        localStorage.setItem('todo_token', token);   // ← persist on login
        return {
            ...state,
            loading: false,
            token
        };
    }),

    on(logout, () => {
        localStorage.removeItem('todo_token');        // ← clear on logout
        return initialAuthState;
    }),

    on(loginFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // REGISTER
    on(register, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(registerSuccess, (state) => ({
        ...state,
        loading: false,
        mode: 'login'
    })),

    on(registerFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    // AUTH MODE
    on(setAuthMode, (state, { mode }) => ({
        ...state,
        mode
    })),

)

