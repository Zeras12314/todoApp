import { createReducer, on } from '@ngrx/store';
import { TodoActions } from './todo.actions';
import { initialTodoState } from './todo.state';

export const todoReducer = createReducer(
  initialTodoState,

  // LOAD
  on(TodoActions.loadTodos, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TodoActions.loadTodosSuccess, (state, { todos }) => ({
    ...state,
    todos,
    loading: false,
  })),

  on(TodoActions.loadTodosFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // CREATE
  on(TodoActions.createTodo, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TodoActions.createTodoSuccess, (state, { todo }) => ({
    ...state,
    todos: [...state.todos, todo],
    loading: false,
  })),

  on(TodoActions.createTodoFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // UPDATE
  on(TodoActions.updateTodo, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TodoActions.updateTodoSuccess, (state, { todo }) => ({
    ...state,
    todos: state.todos.map((t) => (t.id === todo.id ? todo : t)),
    loading: false,
  })),

  on(TodoActions.updateTodoFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // DELETE
  on(TodoActions.deleteTodo, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TodoActions.deleteTodoSuccess, (state, { id }) => ({
    ...state,
    todos: state.todos.filter((t) => t.id !== id),
    loading: false,
  })),

  on(TodoActions.deleteTodosSuccess, (state, { ids }) => ({
    ...state,
    todos: state.todos.filter((t) => !ids.includes(t.id)),
    loading: false,
  })),

  on(TodoActions.deleteTodoFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // FILTERS
  on(TodoActions.setStatusFilter, (state, { status }) => ({
    ...state,
    filters: { ...state.filters, status: status || null },
  })),

  on(TodoActions.setPriorityFilter, (state, { priority }) => ({
    ...state,
    filters: { ...state.filters, priority: priority || null },
  })),

  on(TodoActions.clearFilters, (state) => ({
    ...state,
    filters: { status: null, priority: null },
  })),

  on(TodoActions.setSort, (state, { sortBy, sortDir }) => ({
  ...state,
  sort: { sortBy, sortDir }
})),
);