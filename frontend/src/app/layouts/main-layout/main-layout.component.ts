import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { TodoFilterComponent } from '../../features/todos/todo-filter/todo-filter.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MobileHeaderComponent } from '../../shared/components/mobile-header/mobile-header.component';
import { TodoFilterMobileComponent } from '../../features/todos/todo-filter/mobile/todo-filter-mobile/todo-filter-mobile.component';
import { MobileNavComponent } from '../../shared/components/mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [MobileNavComponent,TodoFilterMobileComponent,SidebarComponent, RouterOutlet, BreadcrumbComponent, MobileHeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {}
