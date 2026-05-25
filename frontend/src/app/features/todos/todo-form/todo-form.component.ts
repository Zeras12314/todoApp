import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Store } from '@ngrx/store';
import { Observable, of, switchMap, take } from 'rxjs';
import { Todo } from '../../../models/todo.model';
import { TodoActions } from '../../../store/todo/todo.actions';
import { selectTodoById } from '../../../store/todo/todo.selectors';
import { TodoService } from '../../../services/todo.service';

interface Subtask {
  name: string;
  done: boolean;
}

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss',
})
export class TodoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly todoService = inject(TodoService);

  isEditMode = false;
  todoId: number | null = null;
  todo: Todo | undefined;
  today = new Date();

  // Static subtasks until backend is ready
  staticSubtasks: Subtask[] = [
    { name: 'Working demo app check', done: false },
    { name: 'Deck check', done: false },
    { name: 'Reservation', done: true },
  ];

  form!: FormGroup;

  readonly statusOptions = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  readonly priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['Todo 01', Validators.required],
      priority: ['', Validators.required],
      status: ['NOT_STARTED', Validators.required],
      dueDate: [null, Validators.required],
      description: ['', Validators.required],
      completedDate: [{ value: null, disabled: true }],
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.todoId = Number(idParam);

      // Lock fields after confirming edit mode
      this.form.get('title')?.disable();
      this.form.get('priority')?.disable();

      this.loadTodo(this.todoId);
    }
    this.watchStatusChanges();

  }

  private loadTodo(id: number): void {
    this.store.select(selectTodoById(id)).pipe(
      take(1),
      switchMap((todo) => todo ? of(todo) : this.todoService.getTodoById(id))
    ).subscribe((todo) => {
      if (todo) {
        this.todo = todo;

        this.form.patchValue({
          title: todo.title,
          priority: todo.priority,
          status: todo.status,
          dueDate: todo.dueDate,
          description: todo.description ?? '',
          completedDate: todo.completedDate ?? null,
        }, { emitEvent: false });

        // Enable completedDate if already completed
        if (todo.status === 'COMPLETED') {
          this.form.get('completedDate')?.enable();
        }
      }
    });
  }

  private watchStatusChanges(): void {
    this.form.get('status')?.valueChanges.subscribe((status) => {
      if (status !== 'COMPLETED') {
        this.form.get('completedDate')?.setValue(null);
        this.form.get('completedDate')?.disable();
      }
    });
  }


  get minDueDate(): Date {
    if (this.isEditMode && this.todo?.createdDate) {
      const d = new Date(this.todo.createdDate);
      d.setDate(d.getDate() + 1); // must be after created date
      return d;
    }
    return this.today;
  }


 get isCompleted(): boolean {
  return this.form.get('status')?.value === 'COMPLETED';
}
  get allSubtasksDone(): boolean {
    return this.staticSubtasks.every((s) => s.done);
  }

  isStatusDisabled(value: string): boolean {
    // return value === 'COMPLETED' && !this.allSubtasksDone;
    return false;
  }

  onSave(): void {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    console.log('completedDate being sent:', formValue.completedDate);

    if (this.isEditMode && this.todoId) {
      const updated: Todo = { ...this.todo!, ...formValue, id: this.todoId };
      console.log('updated payload:', updated);
      this.store.dispatch(TodoActions.updateTodo({ todo: updated }));
    } else {
      this.store.dispatch(TodoActions.createTodo({ todo: formValue }));
    }
  }

  onCancel(): void {
    this.router.navigate(['/todos']);
  }
}