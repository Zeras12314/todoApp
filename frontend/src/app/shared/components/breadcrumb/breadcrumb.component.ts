import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, startWith } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  breadcrumbs: { label: string; url: string; active: boolean }[] = [];

  isChildRoute = false;
  currentLabel = '';

  ngOnInit() {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null)   // fires immediately on first load
    ).subscribe(() => {
      this.buildBreadcrumbs();
    });
  }

  private buildBreadcrumbs() {
    const root = this.route.root;

    let currentRoute = root;
    let label = '';

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;

      const routeLabel = currentRoute.snapshot.data['breadcrumb'];

      if (routeLabel) {
        label = routeLabel;
      }
    }

    this.isChildRoute = !!label;
    this.currentLabel = label;
  }

  goBack() {
    window.history.back();
  }


}
