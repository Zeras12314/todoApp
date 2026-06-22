import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Store } from '@ngrx/store';
import { firstValueFrom, map, merge, Observable, of, switchMap, take } from 'rxjs';
import { Todo, TodoAttachment } from '../../../models/todo.model';
import { TodoActions } from '../../../store/todo/todo.actions';
import { selectTodoById } from '../../../store/todo/todo.selectors';
import { TodoService } from '../../../services/todo.service';
import { ToastService } from '../../../services/toast.service';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { Actions, ofType } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StoreService } from '../../../store/store.service';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { StatusLabelPipe } from '../../../pipes/status.label.pipe';
import { StatusBottomSheetComponent } from '../../../shared/components/status-bottom-sheet/status-bottom-sheet.component';

type SaveResult =
  | { ok: true; todoId: number }
  | { ok: false; error: string };


@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FileUploaderComponent,
    MatSlideToggleModule,
    JsonPipe,
    StatusLabelPipe,
    MatBottomSheetModule
  ],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly todoService = inject(TodoService);
  private readonly toastService = inject(ToastService)
  private readonly actions$ = inject(Actions);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly storeService = inject(StoreService)
  private readonly bottomSheet = inject(MatBottomSheet);

  @ViewChild('fileUploader') fileUploader!: FileUploaderComponent;
  @ViewChild('statusSelect') statusSelect?: MatSelect;
  @ViewChild('statusInputMobile') statusInputMobile?: ElementRef<HTMLInputElement>;

  isAddSubtaskPressed = signal(false);
  isEditMode = false;
  todoId: number | null = null;
  todo: Todo | undefined;
  today = new Date();

  form!: FormGroup;
  minDueDate: Date = new Date();
  hasUserCompletedSubtasks = false;
  markedAsComplete = false;
  isSaving = false;

  // existing attachments the user removed in this session — only deleted on the backend once Save succeeds
  private pendingRemovals: number[] = [];

  private readonly MAX_SUBTASKS = 10;
  private readonly INCOMPLETE_SUBTASKS_MESSAGE = 'Cannot mark as completed: not all subtasks are done.';

  readonly statusOptions = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  readonly priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  constructor() {
    this.today.setHours(0, 0, 0, 0);
    let initialized = false;
    effect(() => {
      const trigger = this.storeService.saveTrigger();
      if (!initialized) {
        initialized = true;
        return;
      }
      if (this.shouldShowMarkAsComplete) {
        this.onMarkAsComplete();
      } else {
        this.onSave();
      }
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['Todo 01', [Validators.required, Validators.maxLength(25)]],
      priority: ['', Validators.required],
      status: ['NOT_STARTED', Validators.required],
      dueDate: [null, Validators.required],
      description: ['', [Validators.required, Validators.maxLength(300)]],
      completedDate: [{ value: null, disabled: true }],
      subTasks: this.fb.array([]),
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.todoId = Number(idParam);

      // Lock fields after confirming edit mode
      this.form.get('title')?.disable();
      this.form.get('priority')?.disable();

      this.loadTodo(this.todoId);
    }
    this.watchStatusChanges();
    this.watchSubtaskChanges();


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDueDate = today;

  }

  openStatusSheet(): void {
    if (!this.isMobile) return;

    this.bottomSheet.open(StatusBottomSheetComponent, {
      panelClass: 'custom-bottom-sheet',
      data: {
        options: this.statusOptions,
        current: this.form.get('status')?.value,
        isDisabled: (value: string) => this.isStatusDisabled(value)
      }
    }).afterDismissed().subscribe(result => {
      if (result) {
        this.form.get('status')?.setValue(result);
        this.form.get('status')?.markAsDirty();
        this.form.get('status')?.markAsTouched();
        this.cdr.markForCheck();
      }
    });
  }

  openPrioritySheet(): void {
    if (!this.isMobile) return;

    this.bottomSheet.open(StatusBottomSheetComponent, {
      panelClass: 'custom-bottom-sheet',
      data: {
        options: this.priorityOptions,
        current: this.form.get('priority')?.value,
        isDisabled: () => false
      }
    }).afterDismissed().subscribe(result => {
      if (result) {
        this.form.get('priority')?.setValue(result);
        this.form.get('priority')?.markAsDirty();
        this.form.get('priority')?.markAsTouched();
        this.cdr.markForCheck();
      }
    });
  }

  private loadTodo(id: number): void {
    this.store.select(selectTodoById(id)).pipe(
      take(1),
      switchMap((todo) => todo ? of(todo) : this.todoService.getTodoById(id))
    ).subscribe((todo) => {
      if (todo) {
        this.todo = todo;
        this.form.patchValue({
          title: todo.title,
          priority: todo.priority,
          status: todo.status,
          dueDate: todo.dueDate,
          description: todo.description ?? '',
          completedDate: todo.completedDate
            ? new Date(todo.completedDate)
            : null,
        }, { emitEvent: false });

        // Enable completedDate if already completed
        // if (todo.status === 'COMPLETED') {
        //   this.form.get('completedDate')?.enable();
        // }
      }

      if (todo.subTasks?.length) {
        todo.subTasks.forEach((s) => {
          this.subTasks.push(this.fb.group({
            id: [s.id],
            title: [s.title, Validators.required],
            completed: [s.completed],
          }));
        });
      }
    });
  }

  private watchStatusChanges(): void {
    this.form.get('status')?.valueChanges.subscribe((status) => {
      const completedDateCtrl = this.form.get('completedDate');

      if (status === 'COMPLETED') {
        // set default value but keep disabled
        if (!completedDateCtrl?.value) {
          completedDateCtrl?.setValue(new Date());
        }
        // do NOT enable, keep disabled
      } else {
        completedDateCtrl?.setValue(null);
        completedDateCtrl?.disable();
      }
    });
  }

  private watchSubtaskChanges(): void {
    this.subTasks.valueChanges.subscribe((subtasks) => {
      const allDone =
        subtasks?.length > 0 &&
        subtasks.every((s: any) => s.completed === true);

      //  only set flag when user completes all
      if (allDone) {
        this.hasUserCompletedSubtasks = true;
        this.cdr.markForCheck();
      } else {
        // a subtask was reopened — a previously selected Completed status is no longer valid
        const statusCtrl = this.form.get('status');
        if (statusCtrl?.value === 'COMPLETED') {
          statusCtrl.setValue('IN_PROGRESS');
          statusCtrl.markAsDirty();
          this.toastService.error(this.INCOMPLETE_SUBTASKS_MESSAGE);

          if (this.isMobile) {
            this.statusInputMobile?.nativeElement.focus();
          } else {
            this.statusSelect?.focus();
          }
        }

        if (this.markedAsComplete) {
          // a subtask was reopened after marking complete — let the flow repeat
          this.markedAsComplete = false;
        }
        this.cdr.markForCheck();
      }
    });

  }

  isStatusDisabled(value: string): boolean {
    return value === 'COMPLETED' && !this.allSubTasksDone;
    // return false;
  }

  onSave(): void {
    console.log('status value:', this.form.get('status')?.value);
    console.log('form valid:', this.form.valid);
    console.log('form value:', this.form.getRawValue());

    const enabledInvalid = Object.keys(this.form.controls).some(key => {
      const ctrl = this.form.get(key);
      return ctrl?.enabled && ctrl?.invalid;
    });

    if (enabledInvalid) {
      this.form.markAllAsTouched();
      this.toastService.error('Please fill in all required fields.');
      return;
    }

    if (this.form.get('status')?.value === 'COMPLETED' && !this.allSubTasksDone) {
      this.toastService.error(this.INCOMPLETE_SUBTASKS_MESSAGE);
      return;
    }

    const formValue = this.form.getRawValue();

    this.isSaving = true;
    this.cdr.markForCheck();

    if (this.isEditMode && this.todoId) {
      const updated: Todo = { ...this.todo!, ...formValue, id: this.todoId };

      this.store.dispatch(TodoActions.updateTodo({ todo: updated }));

      merge(
        this.actions$.pipe(ofType(TodoActions.updateTodoSuccess), map((): SaveResult => ({ ok: true, todoId: this.todoId! }))),
        this.actions$.pipe(ofType(TodoActions.updateTodoFailure), map(({ error }): SaveResult => ({ ok: false, error }))),
      ).pipe(take(1)).subscribe((result: SaveResult) => {
        if (result.ok) {
          this.syncAttachments(result.todoId);
        } else {
          this.onSaveFailure('Failed to save task.');
        }
      });

    } else {
      this.store.dispatch(TodoActions.createTodo({ todo: formValue }));

      merge(
        this.actions$.pipe(ofType(TodoActions.createTodoSuccess), map(({ todo }): SaveResult => ({ ok: true, todoId: todo.id }))),
        this.actions$.pipe(ofType(TodoActions.createTodoFailure), map(({ error }): SaveResult => ({ ok: false, error }))),
      ).pipe(take(1)).subscribe((result: SaveResult) => {
        if (result.ok) {
          this.syncAttachments(result.todoId);
        } else {
          this.onSaveFailure('Failed to save task.');
        }
      });
    }
  }

  private onSaveFailure(error: string): void {
    this.isSaving = false;
    this.toastService.error(error || 'Failed to save task.');
    this.cdr.markForCheck();
  }

  onMarkAsComplete(): void {
    const statusCtrl = this.form.get('status');
    statusCtrl?.setValue('COMPLETED');
    statusCtrl?.markAsDirty();
    statusCtrl?.markAsTouched();

    this.markedAsComplete = true;
    this.cdr.markForCheck();

    if (this.isMobile) {
      this.statusInputMobile?.nativeElement.focus();
    } else {
      this.statusSelect?.focus();
    }
  }

  onCancel(): void {
    this.router.navigate(['/todos']);
  }

  addSubTask(): void {
    if (this.subTasks.length >= this.MAX_SUBTASKS) {
      this.toastService.error(`Maximum of ${this.MAX_SUBTASKS} subtasks allowed.`);
      return;
    }

    //  Extract existing subtask numbers from titles (e.g., "Subtask 01" -> 1)
    const existingIndexes = this.subTasks.controls.map(control => {
      const title = control.get('title')?.value || '';
      const match = title.match(/Subtask\s*(\d+)/); // Match "Subtask XX" and capture the number
      return match ? parseInt(match[1], 10) : 0;
    });

    const nextIndex = existingIndexes.length
      ? Math.max(...existingIndexes) + 1
      : 1;

    const formattedIndex = nextIndex.toString().padStart(2, '0');

    this.subTasks.insert(0, this.fb.group({
      title: [`Subtask ${formattedIndex}`, Validators.required],
      completed: [false],
    }));
  }

  get isSubtaskLimitReached(): boolean {
    return this.subTasks.length >= this.MAX_SUBTASKS;
  }


  removeSubtask(index: number): void {
    this.subTasks.removeAt(index);
  }

  // uploads staged files and applies queued removals — only called after the todo itself is saved
  private async syncAttachments(todoId: number) {
    try {
      if (this.fileUploader?.files?.length) {
        await this.fileUploader.uploadAll(todoId);
      }

      if (this.pendingRemovals.length) {
        await Promise.all(
          this.pendingRemovals.map(id => firstValueFrom(this.todoService.deleteAttachment(todoId, id)))
        );
        this.pendingRemovals = [];
      }
    } catch {
      this.toastService.error('Some attachment changes failed to save');
    } finally {
      this.isSaving = false;
      this.router.navigate(['/todos']);
    }
  }

  onDelete(): void {
    if (!this.todoId) return;

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message: 'This task will be permanently deleted.',
        confirmText: 'Delete'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(TodoActions.deleteTodo({ id: this.todoId! }));
        this.actions$.pipe(ofType(TodoActions.deleteTodoSuccess), take(1))
          .subscribe(() => this.router.navigate(['/todos']));
      }
    });
  }

  OnRemoveSubtask(index: number): void {
    const subtaskTitle = this.subTasks.at(index)?.value?.title;

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          image: '/Icons/Alert.svg',
          message: 'Delete this subtask?',
          message2: subtaskTitle,
          confirmText: 'Remove'
        }
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;

        this.subTasks.removeAt(index);

        // for OnPush
        this.cdr.markForCheck();
      });
  }

  onRemoveExisting(att: TodoAttachment): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Attachment',
        message: `"${att.fileName}" will be removed.`,
        confirmText: 'Remove'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        // queue the removal — actually deleted from the backend only once Save succeeds
        this.pendingRemovals.push(att.id);

        if (this.todo) {
          // new object reference triggers OnPush
          this.todo = {
            ...this.todo,
            attachments: this.todo.attachments.filter(a => a.id !== att.id)
          };
          this.cdr.markForCheck();   // tell OnPush to re-render
        }
      }
    });
  }


  // GETTERS
  // SUBTASK
  get subTasks(): FormArray {
    return this.form.get('subTasks') as FormArray;
  }

  get allSubTasksDone(): boolean {
    return this.subTasks.controls.every((control) => control.value.completed);
  }

  get isCompleted(): boolean {
    return this.form.get('status')?.value === 'COMPLETED';
  }

  get showCompletionDateField(): boolean {
    return this.form.get('status')?.value === 'COMPLETED';
  }

  get shouldShowMarkAsComplete(): boolean {
    return this.subTasks.length > 0 &&
      this.allSubTasksDone &&
      this.hasUserCompletedSubtasks &&
      !this.markedAsComplete;
  }

  get isMobile(): boolean {
    return this.storeService.isMobile() ?? false;
  }
}