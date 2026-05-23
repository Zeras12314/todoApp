import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthMode, selectLoading, selectUser } from './auth/auth.selector';
import { BehaviorSubject } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  store = inject(Store);
  loading$ = this.store.select(selectLoading);
  mode$ = this.store.select(selectAuthMode);
  user$ = this.store.select(selectUser);


  private todosSubject = new BehaviorSubject<Todo[]>([]);
  todo$ = this.todosSubject.asObservable();
  todoService: any;


  loadTodos() {
    this.todoService.getTodos().subscribe(todos => {
      this.todosSubject.next(todos);
    });
  }
}
