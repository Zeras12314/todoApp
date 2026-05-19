import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../store/auth/auth.selector';
import { map, take } from 'rxjs';

export const noAuthGuard: CanActivateFn = () => {
    const store = inject(Store);
    const router = inject(Router);
    return store.select(selectIsAuthenticated).pipe(
        take(1),
        map(auth => auth ? router.createUrlTree(['/todos']): true)
    )
};