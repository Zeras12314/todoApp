import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { map, of, startWith, switchMap, timer } from 'rxjs';
import { StoreService } from '../../../store/store.service';

const SLOW_LOADING_DELAY_MS = 4000;

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
})
export class LoadingOverlayComponent {
  storeService = inject(StoreService);

  loading$ = this.storeService.loading$;

  // Only surfaced once loading drags past SLOW_LOADING_DELAY_MS, so quick
  // actions (e.g. login) never show the "free tier" disclaimer.
  showSlowMessage$ = this.loading$.pipe(
    switchMap((isLoading) =>
      isLoading
        ? timer(SLOW_LOADING_DELAY_MS).pipe(map(() => true), startWith(false))
        : of(false),
    ),
  );

  constructor() {}
}
