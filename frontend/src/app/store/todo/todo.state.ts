import { Todo } from "../../models/todo.model";

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string | null;
    priority: string | null;
  };
}

export const initialTodoState: TodoState = {
  todos: [],
  loading: false,
  error: null,
  filters: {
    status: null,
    priority: null,
  },
};