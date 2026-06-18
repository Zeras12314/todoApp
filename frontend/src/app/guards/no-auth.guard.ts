import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthStatus, selectIsAuthenticated } from '../store/auth/auth.selector';
import { filter, map, take } from 'rxjs';

// no-auth.guard.ts — same pattern, inverted
export const noAuthGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectAuthStatus).pipe(
    filter((status) => status !== 'unknown'),
    take(1),
    map((status) =>
      status === 'authenticated' ? router.createUrlTree(['/todos']) : true,
    ),
  );
};
