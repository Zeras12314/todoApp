import { Component, inject, OnInit } from '@angular/core';
import { TodoService } from '../../../services/todo.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';
import { Todo } from '../../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements OnInit {
  todoService = inject(TodoService);
  todo$: Observable<Todo[]>;

  ngOnInit(): void {
    this.todo$ = this.todoService.getTodos();
  }
}
