import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { StoreService } from '../../../store/store.service';

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

  constructor() {}
}
