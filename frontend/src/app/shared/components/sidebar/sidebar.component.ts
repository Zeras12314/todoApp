import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { StoreService } from '../../../store/store.service';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatButtonModule, AsyncPipe, JsonPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly dialog = inject(MatDialog);
  store = inject(Store);
  storeService = inject(StoreService);
  user$ = this.storeService.user$

  signOut() {
    console.log("Logout");
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '90vw',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

}
