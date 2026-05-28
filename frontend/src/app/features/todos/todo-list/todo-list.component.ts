import { AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AsyncPipe, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Todo } from '../../../models/todo.model';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { TodoFilterComponent } from '../todo-filter/todo-filter.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Store } from '@ngrx/store';
import { StoreService } from '../../../store/store.service';
import { selectAllTodos, selectFilteredTodos } from '../../../store/todo/todo.selectors';
import { TodoActions } from '../../../store/todo/todo.actions';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [RouterLink, MatSortModule, TodoFilterComponent, MatTableModule, MatButtonModule, MatIconModule, MatCheckboxModule, AsyncPipe, DatePipe, TitleCasePipe, NgClass],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})


export class TodoListComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  router = inject(Router);
  storeService = inject(StoreService);
  store = inject(Store);
  todo$: Observable<Todo[]>;
  selectedIds: number[] = [];

  allTodos$: Observable<Todo[]>;
  filteredTodos$: Observable<Todo[]>;

  hasTodos$: Observable<boolean>;
  hasFilteredTodos$: Observable<boolean>;

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
    this.storeService.loadTodos();
    this.allTodos$ = this.store.select(selectAllTodos);
    this.filteredTodos$ = this.store.select(selectFilteredTodos);
    this.hasTodos$ = this.allTodos$.pipe(
      map(todos => todos.length > 0)
    );

    this.hasFilteredTodos$ = this.filteredTodos$.pipe(
      map(todos => todos.length > 0)
    );

    this.todo$ = this.filteredTodos$;

    // Clear selection after bulk delete success
    this.store.select(selectAllTodos).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.selectedIds = [];
    });
  }



  ngAfterViewInit(): void {
    this.todo$.pipe(takeUntil(this.destroy$)).subscribe((todos) => {
      this.dataSource.data = todos;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToCreateTodo() {
    this.router.navigate(['/todos/new']);
  }
  // Checks whether an element is expanded.
  isExpanded(todo: Todo): boolean {
    return this.expandedTodo === todo;
  }

  // Toggles the expanded state of an element.
  toggle(todo: Todo): void {
    this.expandedTodo = this.isExpanded(todo) ? null : todo;
  }

  isOverdue(todo: Todo): boolean {
    if (todo.status === 'COMPLETED' || todo.status === 'CANCELLED') return false;
    return new Date(todo.dueDate) < new Date();
  }

  isWarning(todo: Todo): boolean {
    if (todo.status === 'COMPLETED' || todo.status === 'CANCELLED') {
      return false;
    }
    const hours =
      (new Date(todo.dueDate).getTime() - Date.now()) / 3_600_000;
    if (todo.priority === 'CRITICAL') {
      return hours >= 0 && hours <= 48;
    }

    return hours >= 0 && hours <= 24;
  }

  onEdit(todo: Todo) {
    this.router.navigate(['/todos', todo.id, 'edit']);
  }

  onCheckboxChange(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter((i) => i !== id);
    }
  }

  onBulkDelete(): void {
    if (this.selectedIds.length === 0) return;
    this.store.dispatch(TodoActions.deleteTodos({ ids: this.selectedIds }));
    this.selectedIds = [];
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
      case 'HIGH': return 'Icons/High_table.svg';
      case 'CRITICAL': return 'Icons/Critical_table.svg';
      default: return 'Icons/Unknown.svg';
    }
  }

  openDeleteDialog() {
    if (this.selectedIds.length === 0) return
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message: `${this.selectedIds.length} ${this.selectedIds.length === 1 ? 'Task' : 'Tasks'} will be deleted`,
        confirmText: 'Delete'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.onBulkDelete();
      }
    });
  }
}
