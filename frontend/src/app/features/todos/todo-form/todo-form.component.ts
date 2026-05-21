import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

interface Subtask {
  title:  string;
  status: string;
}

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './todo-form.component.html',
  styleUrl:    './todo-form.component.scss',
})
export class TodoFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  isEdit    = false;
  todoId: string | null = null;
  subtasks: Subtask[] = [];

  todoForm: FormGroup = this.fb.group({
    title:         ['', [Validators.required, Validators.maxLength(25)]],
    priority:      [{ value: '', disabled: true }],
    status:        ['NOT_STARTED'],
    createdAt:     [{ value: '', disabled: true }],
    dueDate:       ['', Validators.required],
    completedDate: [''],
    details:       ['', Validators.maxLength(300)],
  });

  ngOnInit() {
    this.todoId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.todoId;

    if (this.isEdit) {
      this.todoForm.get('title')!.disable();
      this.todoForm.get('priority')!.disable();
      // TODO: load todo from store and patch form
    }

    // auto-set completedDate when status changes to COMPLETED
    this.todoForm.get('status')!.valueChanges.subscribe(val => {
      const ctrl = this.todoForm.get('completedDate')!;
      if (val === 'COMPLETED' && !ctrl.value) {
        ctrl.setValue(new Date());
      }
    });
  }

  addSubtask()            { this.subtasks.push({ title: '', status: 'NOT_DONE' }); }
  removeSubtask(i: number){ this.subtasks.splice(i, 1); }

  onFileSelect(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    console.log('files selected:', files);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    console.log('files dropped:', e.dataTransfer?.files);
  }

  onBack()   { this.router.navigate(['/todos']); }
  onDelete() { /* dispatch delete + navigate back */ }

  onSubmit() {
    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      return;
    }
    // TODO: dispatch createTodo or updateTodo
  }
}