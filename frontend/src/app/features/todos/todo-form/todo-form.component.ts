import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, DatePipe, JsonPipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Store } from '@ngrx/store';
import { Observable, of, switchMap, take } from 'rxjs';
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
    JsonPipe
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

  @ViewChild('fileUploader') fileUploader!: FileUploaderComponent;

  isAddSubtaskPressed = signal(false);
  isEditMode = false;
  todoId: number | null = null;
  todo: Todo | undefined;
  today = new Date();

  form!: FormGroup;
  autoCompletedBySubtasks: boolean
  minDueDate: Date = new Date();

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
      this.onSave();
    });


  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['Todo 01', Validators.required],
      priority: ['', Validators.required],
      status: ['NOT_STARTED', Validators.required],
      dueDate: [null, Validators.required],
      description: ['', Validators.required],
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


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDueDate = today;

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
        if (todo.status === 'COMPLETED') {
          this.form.get('completedDate')?.enable();
        }
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
      if (status !== 'COMPLETED') {
        this.form.get('completedDate')?.setValue(null);
        this.form.get('completedDate')?.disable();
      }
    });
  }

  isStatusDisabled(value: string): boolean {
    return value === 'COMPLETED' && !this.allSubTasksDone;
    // return false;
  }

  onSave(): void {
    const enabledInvalid = Object.keys(this.form.controls).some(key => {
      const ctrl = this.form.get(key);
      return ctrl?.enabled && ctrl?.invalid;
    });

    if (enabledInvalid) {
      this.form.markAllAsTouched();
      this.toastService.error('Please fill in all required fields.');
      return;
    }

    const formValue = this.form.getRawValue();

    const { status } = this.resolveTodoStatus(formValue);

    formValue.status = status;

    if (this.isEditMode && this.todoId) {
      const updated: Todo = { ...this.todo!, ...formValue, id: this.todoId };

      this.store.dispatch(TodoActions.updateTodo({ todo: updated }));

      this.actions$
        .pipe(ofType(TodoActions.updateTodoSuccess), take(1))
        .subscribe(() => this.uploadPendingFiles(this.todoId!));

    } else {
      this.store.dispatch(TodoActions.createTodo({ todo: formValue }));

      this.actions$
        .pipe(ofType(TodoActions.createTodoSuccess), take(1))
        .subscribe(({ todo }) => this.uploadPendingFiles(todo.id));
    }
  }

  // helper to determine if status should be auto-completed by subtasks
  private resolveTodoStatus(formValue: any): {
    status: string;
    autoCompleted: boolean;
  } {
    const allDone =
      formValue.subTasks?.length > 0 &&
      formValue.subTasks.every((s: any) => s.completed);

    const shouldAutoComplete =
      allDone && formValue.status !== 'COMPLETED';

    return {
      status: shouldAutoComplete ? 'COMPLETED' : formValue.status,
      autoCompleted: shouldAutoComplete
    };
  }

  onCancel(): void {
    this.router.navigate(['/todos']);
  }

  addSubTask(): void {
    if (this.subTasks.length >= 10) {
      this.toastService.error('Maximum of 10 subtasks allowed.');
      return;
    }

    const nextIndex = this.subTasks.length + 1;

    this.subTasks.push(this.fb.group({
      title: [`Task 0${nextIndex}`, Validators.required],
      completed: [false],
    }));
  }


  removeSubtask(index: number): void {
    this.subTasks.removeAt(index);
  }

  // call uploadAll after todo is saved
  private async uploadPendingFiles(todoId: number) {
    console.log('uploadPendingFiles called, todoId:', todoId);
    console.log('files to upload:', this.fileUploader?.files);

    try {
      if (this.fileUploader?.files?.length) {
        await this.fileUploader.uploadAll(todoId);
      } else {
        console.log('no files to upload');
      }
    } catch {
      this.toastService.error('Some files failed to upload');
    } finally {
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
        this.todoService.deleteAttachment(this.todoId!, att.id)
          .subscribe(() => {
            if (this.todo) {
              // new object reference triggers OnPush
              this.todo = {
                ...this.todo,
                attachments: this.todo.attachments.filter(a => a.id !== att.id)
              };
              this.cdr.markForCheck();   // tell OnPush to re-render
            }
          });
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
    return this.isEditMode && this.todo?.status === 'COMPLETED' && this.form.get('status')?.value === 'COMPLETED';
  }

}