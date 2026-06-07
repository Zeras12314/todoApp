import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { MobileHeaderComponent } from '../../shared/components/mobile-header/mobile-header.component';
import { TodoFilterMobileComponent } from '../../features/todos/todo-filter/mobile/todo-filter-mobile/todo-filter-mobile.component';
import { MobileNavComponent } from '../../shared/components/mobile-nav/mobile-nav.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { StoreService } from '../../store/store.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [MobileNavComponent, TodoFilterMobileComponent, SidebarComponent, RouterOutlet, BreadcrumbComponent, MobileHeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly sotreService = inject(StoreService) 

  hideBreadCrumb = computed(() => {
    return this.isTodoListPage() && this.sotreService.isMobile();
  });

  currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    )
  );

  isTodoListPage = computed(() => this.currentUrl() === '/todos');
}
