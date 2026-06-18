import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AuthActions } from '../../../store/auth/auth.action';
import { Store } from '@ngrx/store';
import { selectAllTodos, selectSelectedIds, selectTodoById } from '../../../store/todo/todo.selectors';
import { AsyncPipe, NgClass } from '@angular/common';
import { TodoActions } from '../../../store/todo/todo.actions';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, of, switchMap, take } from 'rxjs';
import { StoreService } from '../../../store/store.service';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [NgClass],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileNavComponent {
  private readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storeService = inject(StoreService);

  store = inject(Store);
  readonly selectedIds = toSignal(
    this.store.select(selectSelectedIds),
    { initialValue: [] }
  );


  url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );


  constructor() {
    // only load if store is empty — avoids duplicate calls with TodoListComponent
    // duplicate call, will remove this for now
    // this.store.select(selectAllTodos).pipe(take(1)).subscribe(todos => {
    //   if (todos.length === 0) {
    //     this.store.dispatch(TodoActions.loadTodos());
    //   }
    // });
    // clear selection whenever navigating away from /todos
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      if (event.url !== '/todos') {
        this.store.dispatch(TodoActions.setSelectedIds({ ids: [] }));
      }
    });
  }

  openLogoutDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'bottom-sheet-dialog',
      width: window.innerWidth <= 576 ? '100vw' : '400px',
      maxWidth: '98vw',

      position:
        window.innerWidth <= 576
          ? { bottom: '75px' }
          : undefined,

      data: {
        title: 'Sign out',
        message: 'Are you sure you want to sign out? All unsaved changes will be lost.',
        dialogAlign: 'end',
        confirmText: 'Sign out',
        confirmAsText: true
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.logout();
      }
    });
  }


  goToEditPage(): void {
    const id = this.currentTodoId();
    if (!id) return;

    this.router.navigate(['/todos', id, 'edit']);
  }

  goToCreateTodoPage(): void {
    this.router.navigate(['/todos/new']);
  }

  currentTodoId = computed(() => {
    const match = this.url().match(/\/todos\/(\d+)/);
    return match ? Number(match[1]) : null;
  });

  currentTodoTitle = toSignal(
    toObservable(this.currentTodoId).pipe(
      switchMap(id => {
        if (!id) return of('');
        return this.store.select(selectAllTodos).pipe(
          map(todos => {
            const todo = todos.find(t => t.id === id);
            return todo?.title ?? '';
          })
        );
      })
    ),
    { initialValue: '' }
  );


  openDeleteDialogMobile(): void {
    const isDetail = this.isTodoDetailPage();
    const isList = this.isTodosListPage();

    // detail page — single delete
    if (isDetail) {
      const id = this.currentTodoId();
      if (!id) return;

      this.dialog.open(ConfirmDialogComponent, {
        panelClass: 'bottom-sheet-dialog',
        width: window.innerWidth <= 576 ? '100vw' : '400px',
        maxWidth: '98vw',
        position: window.innerWidth <= 576 ? { bottom: '75px' } : undefined,
        data: {
          image: '/Icons/Alert.svg',
          message: 'Delete this subtask?',
          message2: this.currentTodoTitle(),
          confirmText: 'Delete'
        }
      }).afterClosed().subscribe(result => {
        if (result) this.deleteTodo(id);
      });

      return;
    }

    // list page — bulk delete
    if (isList) {
      const ids = this.selectedIds() ?? [];
      if (ids.length === 0) return;

      this.dialog.open(ConfirmDialogComponent, {
        panelClass: 'bottom-sheet-dialog',
        width: window.innerWidth <= 576 ? '100vw' : '400px',
        maxWidth: '98vw',
        position: window.innerWidth <= 576 ? { bottom: '75px' } : undefined,
        data: {
          image: '/Icons/Alert.svg',
          span: `${ids.length} `,
          message: `${ids.length === 1 ? 'Task' : 'Tasks'} will be deleted`,
          confirmText: 'Delete'
        }
      }).afterClosed().subscribe(result => {
        if (result) this.onBulkDelete();
      });
    }
  }
  onBulkDelete(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.store.dispatch(TodoActions.deleteTodos({ ids }));

    // Clear selection via store
    this.store.dispatch(TodoActions.setSelectedIds({ ids: [] }));

  }

  deleteTodo(id: number): void {
    this.store.dispatch(TodoActions.deleteTodo({ id }));
    this.router.navigate(['/todos']);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }


  onSaveClick(): void {
    this.storeService.triggerSave();
  }



  // ROUTE CHECKER
  isTodosListPage = computed(() => {
    return this.url() === '/todos';
  });

  isTodoDetailPage = computed(() => {
    return /^\/todos\/\d+$/.test(this.url());
  });

  isEditPage = computed(() => {
    return this.url().includes('/edit');
  });

  isCreateTodoPage = computed(() => {
    return this.url().includes('/new')
  })

}
