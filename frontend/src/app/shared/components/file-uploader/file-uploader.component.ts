import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, inject, Input, Output, EventEmitter
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastService } from '../../../services/toast.service';
import { TodoAttachment } from '../../../models/todo.model';
import { TodoService } from '../../../services/todo.service';

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
  private readonly toastService = inject(ToastService);
  private readonly todoService = inject(TodoService);
  private readonly MAX_FILES = 5;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];


  @Input() existingFiles: TodoAttachment[] = [];

  // emit when an existing file is removed so parent can call API
  @Output() removeExisting = new EventEmitter<TodoAttachment>();

  uploadProgress = 0;
  isUploading = false;
  currentFileName = '';
  files: File[] = [];
  uploadInterval: any;
  validationMessage = '';

  // ── DRAG & DROP ──
  onDragOver(event: DragEvent) { event.preventDefault(); }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files?.length) this.stageFiles(Array.from(files));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.stageFiles(Array.from(input.files));
    input.value = '';
  }

  stageFiles(files: File[]): void {
    if (this.isUploading) return;
    if (!files.length) return;

    this.validationMessage = '';

    // filter valid files first
    const validFiles: File[] = [];

    for (const file of files) {
      const totalFiles = this.existingFiles.length + this.files.length + validFiles.length;

      if (totalFiles >= this.MAX_FILES) {
        this.validationMessage = `Maximum of ${this.MAX_FILES} attachments allowed.`;
        this.toastService.error(this.validationMessage);
        break;
      }

      if (!this.ALLOWED_TYPES.includes(file.type)) {
        this.toastService.error(`${file.name}: Only PNG, JPG, GIF, or WEBP images are allowed.`);
        continue;
      }

      if (file.size > this.MAX_FILE_SIZE) {
        this.toastService.error(`${file.name}: File size must not exceed 10MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) return;

    // stage all valid files one by one with progress
    this.uploadQueue(validFiles, 0);
  }

  private uploadQueue(files: File[], index: number): void {
    if (index >= files.length) return;

    const file = files[index];
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
        this.uploadProgress = 0;
        this.currentFileName = '';

        // check if more files to process
        if (index + 1 < files.length) {
          this.uploadQueue(files, index + 1);
        } else {
          this.isUploading = false;
        }

        this.cdr.markForCheck();
      }
    }, 100);
  }

  // ── UPLOAD ALL STAGED FILES ──
  // called by parent after todo is saved
  uploadAll(todoId: number): Promise<void> {
    if (!this.files.length) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const uploads = this.files.map(f =>
        this.todoService.uploadAttachment(todoId, f).toPromise()
      );
      Promise.all(uploads)
        .then(() => {
          this.files = [];
          this.cdr.markForCheck();
          resolve();
        })
        .catch(reject);
    });
  }

  // ── REMOVE STAGED FILE ──
  removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
    this.validationMessage = '';
    this.cdr.markForCheck();
  }

  // ── REMOVE EXISTING FILE ──
  onRemoveExisting(file: TodoAttachment): void {
    this.removeExisting.emit(file);
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }
}