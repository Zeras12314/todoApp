import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Store } from '@ngrx/store';

import {
  login,
  register,
  setAuthMode
} from '../../../store/auth/auth.action';

import { selectAuthMode } from '../../../store/auth/auth.selector';

type AuthMode = 'login' | 'signup' | 'success';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {

  private store = inject(Store);

  hide = true;

  // ✅ convert store → signal (NO subscriptions needed)
  mode = signal<AuthMode>('signup');

  constructor() {
    // sync NgRx store → signal
    this.store.select(selectAuthMode).subscribe(m => this.mode.set(m));

    // react to mode changes
    effect(() => {
      this.updatePasswordValidators();
    });
  }

  // form
  userForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('')
  });

  // validators
  private readonly loginValidators = [
    Validators.required
  ];

  private readonly signupValidators = [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^[a-zA-Z0-9 !#()_-]+$/)
  ];

  // toggle mode (FIXED)
  toggleMode() {
    const next = this.mode() === 'login' ? 'signup' : 'login';

    this.store.dispatch(setAuthMode({ mode: next }));
  }

  // update validators (clean + reactive)
  private updatePasswordValidators() {
    const control = this.userForm.get('password');
    if (!control) return;

    const validators =
      this.mode() === 'signup'
        ? this.signupValidators
        : this.loginValidators;

    control.setValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
  }

  // submit
  submit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const username = this.username?.value ?? '';
    const password = this.password?.value ?? '';

    if (this.mode() === 'login') {
      this.store.dispatch(login({ username, password }));
    } else {
      this.store.dispatch(register({ username, password }));
    }
  }

  // getters
  get username() {
    return this.userForm.get('username');
  }

  get password() {
    return this.userForm.get('password');
  }

  // title
  get title(): string {
    switch (this.mode()) {
      case 'signup':
        return 'Create an account';
      case 'login':
        return 'Sign in';
      case 'success':
        return 'Account successfully created. Sign in to continue';
      default:
        return '';
    }
  }
}