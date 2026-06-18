import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
import { AuthActions } from '../../../store/auth/auth.action';
import { selectAuthStatus } from '../../../store/auth/auth.selector';

@Component({
  selector: 'app-o-auth2-callback',
  standalone: true,
  imports: [],
  templateUrl: './o-auth2-callback.component.html',
  styleUrl: './o-auth2-callback.component.scss'
})
export class OAuth2CallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  ngOnInit(): void {
    // cookie was set by the backend before redirecting here; verify it
    this.store.dispatch(AuthActions.checkAuth());

    this.store.select(selectAuthStatus).pipe(
      filter((status) => status !== 'unknown'),
      take(1),
    ).subscribe((status) => {
      if (status === 'authenticated') {
        this.router.navigate(['/todos']);
      } else {
        this.router.navigate(['/login'], { queryParams: { error: 'oauth2_failed' } });
      }
    });
  }
}