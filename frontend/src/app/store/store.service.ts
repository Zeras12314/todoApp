import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthMode, selectLoading, selectUser } from './auth/auth.selector';
import { BehaviorSubject } from 'rxjs';
import { Todo } from '../models/todo.model';
import { TodoActions } from './todo/todo.actions';
import { selectFilteredTodos } from './todo/todo.selectors';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private store = inject(Store);

  // selectors
  loading$ = this.store.select(selectLoading);
  mode$ = this.store.select(selectAuthMode);
  user$ = this.store.select(selectUser);
  todos$ = this.store.select(selectFilteredTodos);
  

  // actions
  loadTodos() {
    this.store.dispatch(TodoActions.loadTodos());
  }

  setPriority(priority: string) {
    this.store.dispatch(TodoActions.setPriorityFilter({ priority }));
  }

  setStatus(status: string) {
    this.store.dispatch(TodoActions.setStatusFilter({ status }));
  }

}
