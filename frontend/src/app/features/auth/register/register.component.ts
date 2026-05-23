import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Store } from '@ngrx/store';

import { AuthActions } from '../../../store/auth/auth.action';

import { selectAuthMode } from '../../../store/auth/auth.selector';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

type AuthMode = 'login' | 'signup' | 'success';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly store = inject(Store);
  hide = true;
  mode = signal<AuthMode>('signup');

  // form
  userForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl(''),
  });

  usernameValue = toSignal(this.userForm.get('username')!.valueChanges, { initialValue: '' });
  passwordValue = toSignal(this.userForm.get('password')!.valueChanges, { initialValue: '' });
  isPasswordValid = computed(() => {
    const password = this.passwordValue()?.toLowerCase() || '';
    const username = this.usernameValue()?.toLowerCase() || '';
    return (
      password.length > 0 &&
      username.length > 0 &&
      !password.includes(username)
    );
  });
  private readonly loginValidators = [Validators.required];
  private readonly signupValidators = [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^[a-zA-Z0-9 !#()_-]+$/),
  ];

  constructor() {
    this.store.select(selectAuthMode).subscribe((m) => this.mode.set(m));

    // react to mode changes
    effect(() => {
      this.updatePasswordValidators();
    });
  }
  // validators

  // toggle mode (FIXED)
  toggleMode() {
    const next = this.mode() === 'login' ? 'signup' : 'login';

    this.store.dispatch(AuthActions.setMode({ mode: next }));
  }

  // update validators
  private updatePasswordValidators() {
    const control = this.userForm.get('password');
    if (!control) return;

    const validators = this.mode() === 'signup' ? this.signupValidators : this.loginValidators;

    control.setValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
  }

  // submit
  submit() {
    const username = this.username?.value ?? '';
    const password = this.password?.value ?? '';

    const needsStrong = this.mode() === 'signup';
    const isStrong = !needsStrong || this.isPasswordStrong(password, username);

    if (this.userForm.invalid || !isStrong) {
      this.userForm.markAllAsTouched();
      this.userForm.markAllAsDirty();
      return;
    }

    if (this.mode() === 'login') {
      this.store.dispatch(AuthActions.login({ username, password }));
    } else {
      this.store.dispatch(AuthActions.register({ username, password }));
    }
  }

doesNotContainUsername(password: string | null, username: string | null): boolean {
  if (!password || !username) return true;
  return !password.toLowerCase().includes(username.toLowerCase());
}

hasMinLength(password: string | null): boolean {
  return (password || '').length >= 8;
}

hasNumberOrSymbol(password: string | null): boolean {
  return /[0-9!#()_\-]/.test(password || '');
}

isPasswordStrong(password: string | null, username: string | null): boolean {
  return (
    this.hasMinLength(password) &&
    this.hasNumberOrSymbol(password) &&
    this.doesNotContainUsername(password, username)
  );
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
