import { Component, inject, output, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { selectTodoFilters } from '../../../store/todo/todo.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { TodoActions } from '../../../store/todo/todo.actions';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [MatChipsModule, MatIconModule, RouterLink],
  templateUrl: './todo-filter.component.html',
  styleUrl: './todo-filter.component.scss',
})
export class TodoFilterComponent {
  private readonly store = inject(Store);
  isOpen = signal(false);
  activeMenu = signal<'priority' | 'status' | null>(null);


  filters = toSignal(this.store.select(selectTodoFilters), {
    initialValue: { priority: null, status: null },
  });
  selectedPriority = () => this.filters().priority;
  selectedStatus = () => this.filters().status;

  // emit to parent / store
  // priorityChange = output<string | null>();
  // statusChange = output<string | null>();

  // Convenience getters so the template stays the same


  toggleFilter() {
    this.isOpen.update(v => !v);
    this.activeMenu.set(null);
  }

  // selectPriority(value: string | null) {
  //   this.selectedPriority.set(value);
  //   this.priorityChange.emit(value);
  //   this.isOpen.set(false);
  // }

  // resetFilter(value: 'priority' | 'status') {
  //   if (value === 'priority') {
  //     this.selectedPriority.set(null);
  //     this.priorityChange.emit(null);
  //   } else {
  //     this.selectedStatus.set(null);
  //     this.statusChange.emit(null);
  //   }
  // }

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

    const map: any = {
      LOW: 'Chip_Low.svg',
      HIGH: 'Chip_High.svg',
      CRITICAL: 'Chip_Critical.svg'
    };

    return '/Chips/' + map[value];
  }

  getStatusChip(value: string | null) {
    if (!value) return null;

    const map: any = {
      NOT_STARTED: 'Chip_Not started.svg',
      IN_PROGRESS: 'Chip_In progress.svg',
      COMPLETED: 'Chip_Complete.svg',
      CANCELLED: 'Chip_Cancelled.svg'
    };

    return '/Chips/' + map[value];
  }

}
