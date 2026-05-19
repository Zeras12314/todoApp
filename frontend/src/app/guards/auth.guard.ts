import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => true;

// todo
// implement that logic the guard needs to read from the auth store — specifically selectIsAuthenticated. That selector doesn't exist yet because you haven't built the auth store slice.

// 1. Build auth store slice
//    ├── auth.actions.ts
//    ├── auth.reducer.ts      ← stores the token + user
//    └── auth.selectors.ts    ← selectIsAuthenticated lives here

// 2. Come back to no-auth.guard.ts and replace with:

// export const noAuthGuard: CanActivateFn = () => {
//   const store  = inject(Store);
//   const router = inject(Router);
//   return store.select(selectIsAuthenticated).pipe(
//     take(1),
//     map(auth => auth ? router.createUrlTree(['/todos']) : true)
//   );
// };