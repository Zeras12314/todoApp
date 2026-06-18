import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthStatus } from '../store/auth/auth.selector';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectAuthStatus).pipe(
    filter((status) => status !== 'unknown'),
    take(1),
    map((status) =>
      status === 'authenticated' ? true : router.createUrlTree(['/login']),
    ),
  );
};
