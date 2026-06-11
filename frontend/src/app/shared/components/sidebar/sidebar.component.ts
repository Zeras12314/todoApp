import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { StoreService } from '../../../store/store.service';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { AuthActions } from '../../../store/auth/auth.action';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatButtonModule, AsyncPipe, RouterLink],
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
      width: '320px',
      maxWidth: '90vw',
      panelClass: 'signout-dialog',

      data: {
        hasCloseButton: false,
        title: 'Sign out',
        message: `
                  <p class="text-start p-0 m-0">
                    Are you sure you want to sign out?<br/>
                    All unsaved changes will be lost.
                  </p>
                `
        ,
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
