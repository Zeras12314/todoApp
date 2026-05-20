import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { logout } from '../../../store/auth/auth.action';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogContent, MatDialogModule, MatDialogActions, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  store = inject(Store);
  router = inject(Router);

  logout() {
    this.store.dispatch(logout());
  }
}
