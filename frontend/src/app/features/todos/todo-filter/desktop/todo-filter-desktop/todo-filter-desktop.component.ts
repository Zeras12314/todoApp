import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectTodoFilters } from '../../../../../store/todo/todo.selectors';
import { TodoActions } from '../../../../../store/todo/todo.actions';


@Component({
  selector: 'app-todo-filter-desktop',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './todo-filter-desktop.component.html',
  styleUrl: './todo-filter-desktop.component.scss',
})
export class TodoFilterDesktopComponent {
  private readonly store = inject(Store);

  isOpen = signal(false);
  activeMenu = signal<'priority' | 'status' | null>(null);

  filters = toSignal(this.store.select(selectTodoFilters), {
    initialValue: { priority: null, status: null },
  });

  selectedPriority = () => this.filters().priority;
  selectedStatus = () => this.filters().status;

  toggleFilter() {
    this.isOpen.update(v => !v);
    this.activeMenu.set(null);
  }

  selectPriority(value: string | null) {
    value
      ? this.store.dispatch(TodoActions.setPriorityFilter({ priority: value }))
      : this.store.dispatch(TodoActions.clearFilters());
    this.isOpen.set(false);
  }

  selectStatus(value: string | null) {
    value
      ? this.store.dispatch(TodoActions.setStatusFilter({ status: value }))
      : this.store.dispatch(TodoActions.clearFilters());
    this.isOpen.set(false);
  }

  resetFilter(type: 'priority' | 'status') {
    if (type === 'priority') {
      this.store.dispatch(TodoActions.setPriorityFilter({ priority: '' }));
    } else {
      this.store.dispatch(TodoActions.setStatusFilter({ status: '' }));
    }
  }

  getPriorityChip(value: string | null) {
    if (!value) return null;
    const map: Record<string, string> = {
      LOW: 'Chip_Low.svg',
      HIGH: 'Chip_High.svg',
      CRITICAL: 'Chip_Critical.svg',
    };
    return '/Chips/' + map[value];
  }

  getStatusChip(value: string | null) {
    if (!value) return null;
    const map: Record<string, string> = {
      NOT_STARTED: 'Chip_Not started.svg',
      IN_PROGRESS: 'Chip_In progress.svg',
      COMPLETED: 'Chip_Complete.svg',
      CANCELLED: 'Chip_Cancelled.svg',
    };
    return '/Chips/' + map[value];
  }
}