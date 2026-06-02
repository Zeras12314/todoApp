import { Component } from '@angular/core';
import { TodoFilterDesktopComponent } from './desktop/todo-filter-desktop/todo-filter-desktop.component';
import { TodoFilterMobileComponent } from './mobile/todo-filter-mobile/todo-filter-mobile.component';


@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [TodoFilterDesktopComponent, TodoFilterMobileComponent],
  templateUrl: './todo-filter.component.html',
  styleUrl: './todo-filter.component.scss',
})
export class TodoFilterComponent {}