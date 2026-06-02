import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.action';
import { Router } from '@angular/router';
import { ConfirmDialogData } from '../../../models/confirm-dialog.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogContent, MatDialogModule, MatDialogActions, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent implements OnInit {

  store = inject(Store);
  router = inject(Router);
  matDialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as ConfirmDialogData;



  ngOnInit(): void {
    this.data.hasCloseButton = this.data.hasCloseButton ?? true;
  }

  onCancel() {
    this.matDialogRef.close(false);
  }

  onConfirm() {
    this.matDialogRef.close(true);
  }
}
