import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Todo } from '../../models/todo.model';


export const TodoActions = createActionGroup({
  source: 'Todo',
  events: {
    // Load
    'Load Todos': emptyProps(),
    'Load Todos Success': props<{ todos: Todo[] }>(),
    'Load Todos Failure': props<{ error: string }>(),

    // Create
    'Create Todo': props<{ todo: Omit<Todo, 'id'> }>(),
    'Create Todo Success': props<{ todo: Todo }>(),
    'Create Todo Failure': props<{ error: string }>(),

    // Update
    'Update Todo': props<{ todo: Todo }>(),
    'Update Todo Success': props<{ todo: Todo }>(),
    'Update Todo Failure': props<{ error: string }>(),

    // Delete
    'Delete Todo': props<{ id: number }>(),
    'Delete Todo Success': props<{ id: number }>(),
    'Delete Todo Failure': props<{ error: string }>(),

    // Delete bulk
    'Delete Todos': props<{ ids: number[] }>(),
    'Delete Todos Success': props<{ ids: number[] }>(),
    'Delete Todos Failure': props<{ error: string }>(),

    // Filter / UI
    'Set Status Filter': props<{ status: string }>(),
    'Set Priority Filter': props<{ priority: string }>(),
    'Clear Filters': emptyProps(),

    // Attachments
    'Upload Attachment': props<{ todoId: number; file: File }>(),
    'Upload Attachment Success': props<{ todoId: number }>(),
    'Upload Attachment Failure': props<{ error: string }>(),

    // Delete Attachment
    'Delete Attachment': props<{ todoId: number; attachmentId: number }>(),
    'Delete Attachment Success': props<{ todoId: number; attachmentId: number }>(),
    'Delete Attachment Failure': props<{ error: string }>(),
  },
});