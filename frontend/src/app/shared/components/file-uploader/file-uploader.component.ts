import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploaderComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toastService = inject(ToastService)

  uploadProgress = 0;
  isUploading = false;
  currentFileName = '';
  files: File[] = [];
  uploadInterval: any;


  // FILE ATTACHEMENTS
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (!files?.length) return;

    this.uploadFiles(Array.from(files));
  }

  uploadFiles(files: File[]): void {
    if (this.isUploading) return;

    const file = files[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

    if (!allowed.includes(file.type)) {
      this.toastService?.error('Only PNG and JPG images are allowed.');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.currentFileName = file.name;
    this.cdr.markForCheck();

    if (this.uploadInterval) clearInterval(this.uploadInterval);

    this.uploadInterval = setInterval(() => {
      this.uploadProgress += 10;
      this.cdr.markForCheck();

      if (this.uploadProgress >= 100) {
        clearInterval(this.uploadInterval);
        this.files = [...this.files, file];
        this.isUploading = false;
        this.uploadProgress = 0;
        this.currentFileName = '';
        this.cdr.markForCheck();
      }
    }, 100);
  }

  removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);  // ← new reference
    this.cdr.markForCheck();
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.uploadFiles(Array.from(input.files));

    input.value = ''; // IMPORTANT (prevents stuck state)
  }

  // FILE ATTACHEMENTS END

}
