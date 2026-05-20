import { Routes } from '@angular/router';
import { noAuthGuard } from './guards/no-auth.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'todos',
        loadComponent: () =>
          import('./features/todos/todo-list/todo-list.component').then((m) => m.TodoListComponent),
      },
      {
        path: 'todos/new',
        loadComponent: () =>
          import('./features/todos/todo-form/todo-form.component').then((m) => m.TodoFormComponent),
      },
      {
        path: 'todos/:id',
        loadComponent: () =>
          import('./features/todos/todo-detail/todo-detail.component').then(
            (m) => m.TodoDetailComponent,
          ),
      },
      {
        path: 'todos/:id/edit',
        loadComponent: () =>
          import('./features/todos/todo-form/todo-form.component').then((m) => m.TodoFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
