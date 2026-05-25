import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { StoreService } from '../../../store/store.service';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { AuthActions } from '../../../store/auth/auth.action';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatButtonModule, AsyncPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly dialog = inject(MatDialog);
  store = inject(Store);
  storeService = inject(StoreService);
  user$ = this.storeService.user$;


  openLogoutDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Sign out',
        message: 'Are you sure you want to sign out? All unsaved changes will be lost.',
        confirmText: 'Sign out'
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
