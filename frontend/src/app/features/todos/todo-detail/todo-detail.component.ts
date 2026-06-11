import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { map, Observable, of, switchMap } from 'rxjs';
import { Todo } from '../../../models/todo.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectTodoById } from '../../../store/todo/todo.selectors';
import { TodoService } from '../../../services/todo.service';
import { TodoActions } from '../../../store/todo/todo.actions';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { StoreService } from '../../../store/store.service';

interface Subtask {
  name: string;
  done: boolean;
}
@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [RouterLink, MatDividerModule, MatIconModule, DatePipe, TitleCasePipe, AsyncPipe, RouterLink],
  templateUrl: './todo-detail.component.html',
  styleUrl: './todo-detail.component.scss',
})
export class TodoDetailComponent {
  // INJECT
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly todoService = inject(TodoService);
  private readonly sotreService = inject(StoreService)


  readonly dialog = inject(MatDialog);

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


  deleteTodo(id: number): void {
    this.store.dispatch(TodoActions.deleteTodos({ ids: [id] }));
    this.router.navigate(['/todos']);
  }

  openDelete(id: number): void {
    if (this.sotreService.isMobile()) {
      this.openDeleteDialogMobile(id);
    } else {
      this.openDeleteDialog(id);
    }
  }


  openDeleteDialog(id: number): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        image: '/Icons/Alert.svg',
        message: `Task will be deleted`,
        confirmText: 'Delete'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.deleteTodo(id);
      }
    });
  }

  openDeleteDialogMobile(id: number): void {
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'bottom-sheet-dialog',
      width: window.innerWidth <= 576 ? '100vw' : '400px',
      maxWidth: '98vw',

      position:
        window.innerWidth <= 576
          ? { bottom: '75px' }
          : undefined,

      data: {
        image: '/Icons/Alert.svg',
        message: `Task will be deleted`,
        confirmText: 'Delete'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.deleteTodo(id);
      }
    });
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

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
