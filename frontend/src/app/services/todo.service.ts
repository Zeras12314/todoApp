import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { env } from '../environment/env';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = env.apiUrl;


  getTodos() {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`);
  }

  getTodoById(id: number) {
    return this.http.get<Todo>(`${this.apiUrl}/todos/${id}`);
  }

}
