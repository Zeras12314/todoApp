import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { TodoActions } from './todo.actions';
import { TodoService } from '../../services/todo.service';

@Injectable()
export class TodoEffects {
    actions$ = inject(Actions);
    todoService = inject(TodoService);

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodos),
      switchMap(() =>
        this.todoService.getTodos().pipe(
          map((todos) => TodoActions.loadTodosSuccess({ todos })),
          catchError((err) => of(TodoActions.loadTodosFailure({ error: err.message })))
        )
      )
    )
  );

//   createTodo$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(TodoActions.createTodo),
//       mergeMap(({ todo }) =>
//         this.todoService.create(todo).pipe(
//           map((created) => TodoActions.createTodoSuccess({ todo: created })),
//           catchError((err) => of(TodoActions.createTodoFailure({ error: err.message })))
//         )
//       )
//     )
//   );

//   updateTodo$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(TodoActions.updateTodo),
//       mergeMap(({ todo }) =>
//         this.todoService.update(todo).pipe(
//           map((updated) => TodoActions.updateTodoSuccess({ todo: updated })),
//           catchError((err) => of(TodoActions.updateTodoFailure({ error: err.message })))
//         )
//       )
//     )
//   );

//   deleteTodo$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(TodoActions.deleteTodo),
//       mergeMap(({ id }) =>
//         this.todoService.delete(id).pipe(
//           map(() => TodoActions.deleteTodoSuccess({ id })),
//           catchError((err) => of(TodoActions.deleteTodoFailure({ error: err.message })))
//         )
//       )
//     )
//   );


}