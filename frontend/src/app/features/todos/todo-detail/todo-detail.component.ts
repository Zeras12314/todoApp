import { AsyncPipe, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of, switchMap, take } from 'rxjs';
import { Todo } from '../../../models/todo.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectTodoById } from '../../../store/todo/todo.selectors';
import { TodoService } from '../../../services/todo.service';

interface Subtask {
  name: string;
  done: boolean;
}
@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [MatDividerModule, MatIconModule, DatePipe, TitleCasePipe, AsyncPipe],
  templateUrl: './todo-detail.component.html',
  styleUrl: './todo-detail.component.scss',
})
export class TodoDetailComponent {
  // INJECT
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly todoService = inject(TodoService);

  // Static until subtasks are implemented in the backend
  staticSubtasks: Subtask[] = [
    { name: 'Working demo app check', done: false },
    { name: 'Deck check', done: false },
    { name: 'Reservation', done: true },
  ];

  todo$!: Observable<Todo | undefined>;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.todo$ = this.store.select(selectTodoById(id)).pipe(
      switchMap((todo) => todo ? of(todo) : this.todoService.getTodoById(id))
    );
  }
  editTodo() {
    // this.router.navigate(['/todos', this.todo?.id, 'edit']);
    return '';
  }

  deleteTodo() {
    return ''
  }

  getPriorityIcon(status: string): string {
    switch (status) {
      case 'LOW': return 'Icons/Low_table.svg';
      case 'HIGH': return 'Icons/High_table.svg';
      case 'CRITICAL': return 'Icons/Critical_table.svg';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Icons/Complete.svg';
      case 'CANCELLED': return 'Icons/Cancelled.svg';
      case 'IN_PROGRESS': return 'Icons/In Progress.svg';
      case 'NOT_STARTED': return 'Icons/Not Started.svg';
      default: return '';
    }
  }
}
