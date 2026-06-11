// status-bottom-sheet.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-bottom-sheet.component.html',
  styleUrl: './status-bottom-sheet.component.scss'
})
export class StatusBottomSheetComponent {
  selected: string;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<StatusBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      options: { value: string; label: string }[];
      current: string;
      title?: string;
      isDisabled: (value: string) => boolean;
    }
  ) {
    this.selected = data.current;
  }

  isDisabled(value: string): boolean {
    return this.data.isDisabled(value);
  }

  apply(): void {
    console.log('applying status:', this.selected);
    this.bottomSheetRef.dismiss(this.selected);
  }

  dismiss(): void {
    this.bottomSheetRef.dismiss(null);
  }
}