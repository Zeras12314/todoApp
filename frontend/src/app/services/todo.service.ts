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


  getAll() {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`);
  }

  getTodoById(id: number) {
    return this.http.get<Todo>(`${this.apiUrl}/todos/${id}`);
  }

  updateTodo(id: number, updatedTodo: Partial<Todo>) {
    return this.http.put<Todo>(`${this.apiUrl}/todos/${id}`, updatedTodo);
  }

  createTodo(newTodo: Omit<Todo, 'id'>) {
    return this.http.post<Todo>(`${this.apiUrl}/todos`, newTodo);
  }

  deleteTodo(ids: number[]) {
    return this.http.delete(`${this.apiUrl}/todos`, { body: ids });
  }

}
