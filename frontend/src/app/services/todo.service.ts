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
    const token = localStorage.getItem('todo_token');

    console.log('TOKEN BEING SENT:', token);

    return this.http.get<Todo[]>(`${this.apiUrl}/todos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
