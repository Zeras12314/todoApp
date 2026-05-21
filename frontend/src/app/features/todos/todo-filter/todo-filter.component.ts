import { Component, output, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [MatChipsModule, MatIconModule, RouterLink],
  templateUrl: './todo-filter.component.html',
  styleUrl: './todo-filter.component.scss',
})
export class TodoFilterComponent {
   isOpen        = signal(false);
  activeMenu    = signal<'priority' | 'status' | null>(null);
  selectedPriority = signal<string | null>(null);
  selectedStatus   = signal<string | null>(null);

  // emit to parent / store
  priorityChange = output<string | null>();
  statusChange   = output<string | null>();

  toggleFilter() {
    this.isOpen.update(v => !v);
    this.activeMenu.set(null);
  }

  selectPriority(value: string | null) {
    this.selectedPriority.set(value);
    this.priorityChange.emit(value);
    this.isOpen.set(false);
  }

  selectStatus(value: string | null) {
    this.selectedStatus.set(value);
    this.statusChange.emit(value);
    this.isOpen.set(false);
  }
}
