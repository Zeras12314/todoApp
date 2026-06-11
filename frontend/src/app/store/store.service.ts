import { inject, Injectable, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthMode, selectLoading, selectUser } from './auth/auth.selector';
import { BehaviorSubject, map } from 'rxjs';
import { Todo } from '../models/todo.model';
import { TodoActions } from './todo/todo.actions';
import { selectFilteredTodos } from './todo/todo.selectors';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly store = inject(Store);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // selectors
  loading$ = this.store.select(selectLoading);
  mode$ = this.store.select(selectAuthMode);
  user$ = this.store.select(selectUser);
  todos$ = this.store.select(selectFilteredTodos);
  saveTrigger = signal(0);


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


  isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(
      map(res => res.matches)
    ),
    { initialValue: false }
  )

  triggerSave() {
    this.saveTrigger.update(v => v + 1);
  }
}
