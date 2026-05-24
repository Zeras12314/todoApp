import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { TodoActions } from './todo.actions';
import { TodoService } from '../../services/todo.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class TodoEffects {
  actions$ = inject(Actions);
  todoService = inject(TodoService);
  toastService = inject(ToastService);
  router = inject(Router);

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodos),
      switchMap(() =>
        this.todoService.getAll().pipe(
          map((todos) => TodoActions.loadTodosSuccess({ todos })),
          catchError((err) => of(TodoActions.loadTodosFailure({ error: err.message })))
        )
      )
    )
  );

  // CREEATE TODO
  createTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.createTodo),
      mergeMap(({ todo }) =>
        this.todoService.createTodo(todo).pipe(
          map((created) => TodoActions.createTodoSuccess({ todo: created })),
          catchError((err) => {
            const message = err.error?.error ?? err.error?.errors?.title ?? 'Something went wrong';
            this.toastService.error(message);
            return of(TodoActions.createTodoFailure({ error: message }));
          })
        )
      )
    )
  );

  // CREATE TODO
  createTodoSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.createTodoSuccess),
      tap(() => {
        this.toastService.success('Todo created successfully');
        this.router.navigate(['/todos']);
      })
    ),
    { dispatch: false }
  );

  updateTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.updateTodo),
      mergeMap(({ todo }) =>
        this.todoService.updateTodo(todo.id, todo).pipe(
          map((updated) => TodoActions.updateTodoSuccess({ todo: updated })),
          catchError((err) => {
            const message =
              err.error?.error ??
              err.error?.errors?.title ??
              'Something went wrong';
            this.toastService.error(message);
            return of(TodoActions.updateTodoFailure({ error: message }));
          })
        )
      )
    )
  );

  updateTodoSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.updateTodoSuccess),
      tap(() => {
        this.toastService.success('Todo updated successfully');
        this.router.navigate(['/todos']);
      })
    ),
    { dispatch: false }
  );

  // ── DELETE SINGLE ─────────────────────────────────────────────────────────
  deleteTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodo),
      mergeMap(({ id }) =>
        this.todoService.deleteTodo([id]).pipe(
          map(() => TodoActions.deleteTodoSuccess({ id })),
          catchError((err) => of(TodoActions.deleteTodoFailure({ error: err.message })))
        )
      )
    )
  );

  deleteTodoSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodoSuccess),
      tap(() => this.toastService.success('Todo deleted successfully'))
    ),
    { dispatch: false }
  );

  // ── DELETE BULK ───────────────────────────────────────────────────────────
  deleteTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodos),
      mergeMap(({ ids }) =>
        this.todoService.deleteTodo(ids).pipe(
          map(() => TodoActions.deleteTodosSuccess({ ids })),
          catchError((err) => of(TodoActions.deleteTodosFailure({ error: err.message })))
        )
      )
    )
  );

  deleteTodosSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.deleteTodosSuccess),
      tap(({ ids }) => this.toastService.success(`${ids.length} todo(s) deleted successfully`))
    ),
    { dispatch: false }
  );

}