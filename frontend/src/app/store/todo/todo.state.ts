import { Todo } from "../../models/todo.model";

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string | null;
    priority: string | null;
  };
  sort: {
    sortBy: 'none' | 'dueDate' | 'priority' | 'status';
    sortDir: 'asc' | 'desc';
  };
  selectedIds: number[];
}

export const initialTodoState: TodoState = {
  todos: [],
  loading: false,
  error: null,
  filters: {
    status: null,
    priority: null,
  },
  sort: { sortBy: 'none', sortDir: 'asc' },
  selectedIds: null
};