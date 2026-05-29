import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, inject, Input, Output, EventEmitter
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastService }        from '../../../services/toast.service';
import { TodoAttachment }      from '../../../models/todo.model';
import { TodoService }         from '../../../services/todo.service';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploaderComponent {
  private readonly cdr          = inject(ChangeDetectorRef);
  private readonly toastService = inject(ToastService);
  private readonly todoService  = inject(TodoService);

  @Input() existingFiles: TodoAttachment[] = [];

  // emit when an existing file is removed so parent can call API
  @Output() removeExisting = new EventEmitter<TodoAttachment>();

  uploadProgress  = 0;
  isUploading     = false;
  currentFileName = '';
  files: File[]   = [];           // ← staged files, parent reads this
  uploadInterval: any;

  // ── DRAG & DROP ──
  onDragOver(event: DragEvent)  { event.preventDefault(); }

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

  // ── STAGE FILES (fake progress bar) ──
  stageFiles(files: File[]): void {
    if (this.isUploading) return;

    const file = files[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.toastService.error('Only PNG and JPG images are allowed.');
      return;
    }

    this.isUploading     = true;
    this.uploadProgress  = 0;
    this.currentFileName = file.name;
    this.cdr.markForCheck();

    if (this.uploadInterval) clearInterval(this.uploadInterval);

    this.uploadInterval = setInterval(() => {
      this.uploadProgress += 10;
      this.cdr.markForCheck();

      if (this.uploadProgress >= 100) {
        clearInterval(this.uploadInterval);
        this.files           = [...this.files, file];
        this.isUploading     = false;
        this.uploadProgress  = 0;
        this.currentFileName = '';
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