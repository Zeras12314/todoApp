import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { TodoService } from '../../../services/todo.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Todo } from '../../../models/todo.model';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TodoFilterComponent } from '../todo-filter/todo-filter.component';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Store } from '@ngrx/store';
import { TodoActions } from '../../../store/todo/todo.actions';
import { selectAllTodos, selectFilteredTodos } from '../../../store/todo/todo.selectors';
import { CdkAutofill } from "@angular/cdk/text-field";

// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
//   description: string;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   {
//     position: 1,
//     name: 'Todo 1',
//     weight: 1,
//     symbol: 'TD1',
//     description: 'This is the first todo item description.',
//   },
//   {
//     position: 2,
//     name: 'Todo 2',
//     weight: 2,
//     symbol: 'TD2',
//     description: 'This is the second todo item description.',
//   },
//   {
//     position: 3,
//     name: 'Todo 3',
//     weight: 3,
//     symbol: 'TD3',
//     description: 'This is the third todo item description.',
//   }
// ];

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [MatSortModule, TodoFilterComponent, MatTableModule, MatButtonModule, MatIconModule, MatCheckboxModule, AsyncPipe, DatePipe, TitleCasePipe, CdkAutofill],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})


export class TodoListComponent implements OnInit, AfterViewInit {
  private _liveAnnouncer = inject(LiveAnnouncer);
  router = inject(Router);
  todoService = inject(TodoService);
  store = inject(Store);
  todo$: Observable<Todo[]>;
  dataSource = new MatTableDataSource<Todo>();
columnsToDisplay = [
  'select',
  // 'expand',
  'title',
  'dueDate',
  'priority',
  'status',
  'edit'
];
  columnsToDisplayWithExpand = [...this.columnsToDisplay];
  // expandedElement: PeriodicElement | null = null;


  // Expanded row state (Todo-based)
  expandedTodo: Todo | null = null;

  todoNotesByTitle: Record<string, string> = {
    'Buy groceries': 'Remember to include milk, eggs, and bread. Check budget.',
    'Finish report': 'Attach screenshots, verify totals, and send before EOD.',
  };
 private readonly destroy$ = new Subject<void>();
  @ViewChild(MatSort)
set matSort(sort: MatSort) {
  if (sort) {
    this.dataSource.sort = sort;
  }
}

  ngOnInit(): void {
    this.store.dispatch(TodoActions.loadTodos());
    this.todo$ = this.store.select(selectFilteredTodos);
  }


 ngAfterViewInit(): void {
    // ✅ takeUntil prevents memory leak; sort assigned once after view init
    this.todo$.pipe(takeUntil(this.destroy$)).subscribe((todos) => {
      this.dataSource.data = todos;
    });
  }

   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToCreateTodo(){
    this.router.navigate(['/todos/new']);
  }
  /** Checks whether an element is expanded. */
  isExpanded(todo: Todo): boolean {
    return this.expandedTodo === todo;
  }

  /** Toggles the expanded state of an element. */
  toggle(todo: Todo): void {
    this.expandedTodo = this.isExpanded(todo) ? null : todo;
  }

  isOverdue(todo: Todo): boolean {
    if (todo.status === 'COMPLETED' || todo.status === 'CANCELLED') return false;
    return new Date(todo.dueDate) < new Date();
  }

  isWarning(todo: Todo): boolean {
    if (todo.status === 'COMPLETED' || todo.status === 'CANCELLED') return false;
    const hours = (new Date(todo.dueDate).getTime() - Date.now()) / 3_600_000;
    return hours >= 0 && hours <= 24;
  }

  onEdit(todo: Todo) {
    this.router.navigate(['/todos', todo.id, 'edit']);
  }


  // Helper to avoid undefined in template
  getTodoNote(todo: Todo): string {
    // If you have todo.id, you can do a map by id instead
    return this.todoNotesByTitle[todo.title] ?? 'No extra notes (static) yet.';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Icons/Complete.svg';
      case 'CANCELLED': return 'Icons/Cancelled.svg';
      case 'IN_PROGRESS': return 'Icons/In Progress.svg';
      case 'NOT_STARTED': return 'Icons/Not Started.svg';
      default: return 'Icons/Unknown.svg';
    }
  }

  getPriorityIcon(status: string): string {
    switch (status) {
      case 'LOW': return 'Icons/Low_table.svg';
      case 'MEDIUM': return 'Icons/Medium_table.svg';
      case 'HIGH': return 'Icons/High_table.svg';
      case 'CRITICAL': return 'Icons/Critical_table.svg';
      default: return 'Icons/Unknown.svg';
    }
  }
}
