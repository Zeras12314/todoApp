import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TodoState } from './todo.state';

export const selectTodoState = createFeatureSelector<TodoState>('todos');

// ── Raw slices ───────────────────────────────────────────────────────────────
export const selectAllTodos    = createSelector(selectTodoState, (s) => s.todos);
export const selectTodoLoading = createSelector(selectTodoState, (s) => s.loading);
export const selectTodoError   = createSelector(selectTodoState, (s) => s.error);
export const selectTodoFilters = createSelector(selectTodoState, (s) => s.filters);

// ── Filtered todos ──────────────────────────────────────────e──────────────────
export const selectFilteredTodos = createSelector(
  selectAllTodos,
  selectTodoFilters,
  (todos, filters) =>
    todos.filter((t) => {
      const matchesStatus   = !filters.status   || t.status   === filters.status;
      const matchesPriority = !filters.priority || t.priority === filters.priority;
      return matchesStatus && matchesPriority;
    })
);

// ── Derived counts ────────────────────────────────────────────────────────────
export const selectTodoCount = createSelector(selectAllTodos, (todos) => todos.length);

export const selectTodosByStatus = (status: string) =>
  createSelector(selectAllTodos, (todos) => todos.filter((t) => t.status === status));

export const selectTodosByPriority = (priority: string) =>
  createSelector(selectAllTodos, (todos) => todos.filter((t) => t.priority === priority));

// ── Single todo ───────────────────────────────────────────────────────────────
export const selectTodoById = (id: number) =>
  createSelector(selectAllTodos, (todos) => todos.find((t) => t.id === id));