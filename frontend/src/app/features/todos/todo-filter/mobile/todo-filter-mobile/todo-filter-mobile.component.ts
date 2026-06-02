import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectTodoFilters, selectTodoSort } from '../../../../../store/todo/todo.selectors';
import { TodoActions } from '../../../../../store/todo/todo.actions';

@Component({
  selector: 'app-todo-filter-mobile',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './todo-filter-mobile.component.html',
  styleUrl: './todo-filter-mobile.component.scss',
})
export class TodoFilterMobileComponent {
  private readonly store = inject(Store);

  isMobileFilterOpen = signal(false);
  isSortOpen         = signal(false);

  // pending filter values
  pendingPriority = signal<string | null>(null);
  pendingStatus   = signal<string | null>(null);

  // pending sort values
  pendingSort    = signal<'none' | 'dueDate' | 'priority' | 'status'>('none');
  pendingSortDir = signal<'asc' | 'desc'>('asc');

  filters = toSignal(this.store.select(selectTodoFilters), {
    initialValue: { priority: null, status: null },
  });

  sort = toSignal(this.store.select(selectTodoSort), {
    initialValue: { sortBy: 'none' as const, sortDir: 'asc' as const },
  });

  selectedPriority = () => this.filters().priority;
  selectedStatus   = () => this.filters().status;
  selectedSort     = () => this.sort().sortBy;
  selectedSortDir  = () => this.sort().sortDir;

  toggleFilter() {
    this.pendingPriority.set(this.selectedPriority());
    this.pendingStatus.set(this.selectedStatus());
    this.isMobileFilterOpen.update(v => !v);
    this.isSortOpen.set(false);
  }

  toggleSort() {
    this.pendingSort.set(this.selectedSort());
    this.pendingSortDir.set(this.selectedSortDir());
    this.isSortOpen.update(v => !v);
    this.isMobileFilterOpen.set(false);
  }

  applyFilters() {
    this.store.dispatch(TodoActions.clearFilters());
    const p = this.pendingPriority();
    const s = this.pendingStatus();
    if (p) this.store.dispatch(TodoActions.setPriorityFilter({ priority: p }));
    if (s) this.store.dispatch(TodoActions.setStatusFilter({ status: s }));
    this.isMobileFilterOpen.set(false);
  }

  applySort() {
    this.store.dispatch(TodoActions.setSort({
      sortBy:  this.pendingSort(),
      sortDir: this.pendingSortDir(),
    }));
    this.isSortOpen.set(false);
  }

  selectPriority(value: string | null) {
    value
      ? this.store.dispatch(TodoActions.setPriorityFilter({ priority: value }))
      : this.store.dispatch(TodoActions.setPriorityFilter({ priority: '' }));
  }

  selectStatus(value: string | null) {
    value
      ? this.store.dispatch(TodoActions.setStatusFilter({ status: value }))
      : this.store.dispatch(TodoActions.setStatusFilter({ status: '' }));
  }

  closeAll() {
    this.isMobileFilterOpen.set(false);
    this.isSortOpen.set(false);
  }

  hasActiveFilters() {
    return !!this.selectedPriority() || !!this.selectedStatus();
  }

  isSortActive() {
    return this.selectedSort() !== 'none';
  }

  getPriorityChip(value: string | null) {
    if (!value) return null;
    const map: Record<string, string> = {
      LOW: 'Chip_Low.svg', HIGH: 'Chip_High.svg', CRITICAL: 'Chip_Critical.svg',
    };
    return '/Chips/' + map[value];
  }

  getStatusChip(value: string | null) {
    if (!value) return null;
    const map: Record<string, string> = {
      NOT_STARTED: 'Chip_Not started.svg',
      IN_PROGRESS: 'Chip_In progress.svg',
      COMPLETED:   'Chip_Complete.svg',
      CANCELLED:   'Chip_Cancelled.svg',
    };
    return '/Chips/' + map[value];
  }

  setSortField(value: 'none' | 'dueDate' | 'priority' | 'status') {
  this.pendingSort.set(value);
  // auto-select ascending when a field is first chosen
  if (value !== 'none' && !this.pendingSortDir()) {
    this.pendingSortDir.set('asc');
  }
}
}