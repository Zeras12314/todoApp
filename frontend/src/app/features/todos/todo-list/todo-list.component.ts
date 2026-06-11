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
import { Store } from '@ngrx/store';
import { StoreService } from '../../../store/store.service';
import { selectAllTodos, selectFilteredTodos, selectSortedFilteredTodos } from '../../../store/todo/todo.selectors';
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

    this.todo$ = this.store.select(selectSortedFilteredTodos);

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

    const due = new Date(todo.dueDate);
    const today = new Date();

    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return due < today;
  }


  isWarning(todo: Todo): boolean {
    if (todo.status === 'COMPLETED' || todo.status === 'CANCELLED') {
      return false;
    }

    if (todo.priority !== 'CRITICAL') {
      const due = new Date(todo.dueDate);
      const today = new Date();

      due.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const days = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      return days >= 0 && days <= 1;
    }

    // critical: only show Today if <= 24 hours
    const hoursUntilDue =
      (new Date(todo.dueDate).getTime() - Date.now()) /
      (1000 * 60 * 60);

    return hoursUntilDue >= 0 && hoursUntilDue <= 24;
  }

  isDueSoon(todo: Todo): boolean {
    if (
      todo.status === 'COMPLETED' ||
      todo.status === 'CANCELLED' ||
      todo.priority !== 'CRITICAL'
    ) {
      return false;
    }

    const hoursUntilDue =
      (new Date(todo.dueDate).getTime() - Date.now()) /
      (1000 * 60 * 60);

    return hoursUntilDue > 24 && hoursUntilDue <= 48;
  }

  onEdit(todo: Todo) {
    this.router.navigate(['/todos', todo.id, 'edit']);
  }

  onCheckboxChange(id: number, checked: boolean): void {
    const current = this.selectedIds;
    const updated = checked
      ? [...current, id]
      : current.filter(i => i !== id);

    this.selectedIds = updated;
    this.store.dispatch(TodoActions.setSelectedIds({ ids: updated }));
  }

  goToTodoDetailsPage(id: number) {
    // clear first, then navigate
    this.selectedIds = [];
    this.store.dispatch(TodoActions.setSelectedIds({ ids: [] }));
    this.router.navigate(['/todos', id]);
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
        image: '/Icons/Alert.svg',
        span: `${this.selectedIds.length} `,
        message: `${this.selectedIds.length === 1 ? 'Task' : 'Tasks'} will be deleted`,
        confirmText: 'Delete'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.onBulkDelete();
      }
    });
  }
}
