import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AuthActions } from '../../../store/auth/auth.action';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss'
})
export class MobileNavComponent {
  readonly dialog = inject(MatDialog);
  store = inject(Store);

  openLogoutDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'bottom-sheet-dialog',
      width: window.innerWidth <= 576 ? '100vw' : '400px',
      maxWidth: '98vw',

      position:
        window.innerWidth <= 576
          ? { bottom: '75px' }
          : undefined,

      data: {
        title: 'Sign out',
        message: 'Are you sure you want to sign out? All unsaved changes will be lost.',
        dialogAlign: 'end',
        confirmText: 'Sign out',
        confirmAsText: true
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.logout();
      }
    });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
