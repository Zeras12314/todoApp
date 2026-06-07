import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.action';

@Component({
  selector: 'app-o-auth2-callback',
  standalone: true,
  imports: [],
  templateUrl: './o-auth2-callback.component.html',
  styleUrl: './o-auth2-callback.component.scss'
})
export class OAuth2CallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const username = this.route.snapshot.queryParamMap.get('username');

    console.log('=== OAuth2 Callback ===');
    console.log('Full URL:', window.location.href);
    console.log('Token:', token);
    console.log('Username:', username);
    console.log('All params:', this.route.snapshot.queryParams);
    console.log('======================');

    if (token && username) {
      this.store.dispatch(AuthActions.loginSuccess({
        token,
        username,
        message: 'Signed in successfully'
      }));
      this.router.navigate(['/todos']);
    } else {
      this.router.navigate(['/login'], { queryParams: { error: 'oauth2_failed' } });
    }
  }
}
