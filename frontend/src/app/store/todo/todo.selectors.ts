import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TodoState } from './todo.state';

export const selectTodoState = createFeatureSelector<TodoState>('todos');

// ── Raw slices 
export const selectAllTodos = createSelector(selectTodoState, (s) => s.todos);
export const selectTodoLoading = createSelector(selectTodoState, (s) => s.loading);
export const selectTodoError = createSelector(selectTodoState, (s) => s.error);
export const selectTodoFilters = createSelector(selectTodoState, (s) => s.filters);

// ── Filtered todos 
export const selectFilteredTodos = createSelector(
  selectAllTodos,
  selectTodoFilters,
  (todos, filters) =>
    todos.filter((t) => {
      const matchesStatus = !filters.status || t.status === filters.status;
      const matchesPriority = !filters.priority || t.priority === filters.priority;
      return matchesStatus && matchesPriority;
    })
);

// ── Derived counts
export const selectTodoCount = createSelector(selectAllTodos, (todos) => todos.length);

export const selectTodosByStatus = (status: string) =>
  createSelector(selectAllTodos, (todos) => todos.filter((t) => t.status === status));

export const selectTodosByPriority = (priority: string) =>
  createSelector(selectAllTodos, (todos) => todos.filter((t) => t.priority === priority));

// ── Single todo 
export const selectTodoById = (id: number) =>
  createSelector(selectAllTodos, (todos) => todos.find((t) => t.id === id));

export const selectTodoSort = createSelector(selectTodoState, (s) => s.sort);

export const selectSortedFilteredTodos = createSelector(
  selectFilteredTodos,
  selectTodoSort,
  (todos, sort) => {
    if (sort.sortBy === 'none') return todos;

    return [...todos].sort((a, b) => {
      let cmp = 0;

      if (sort.sortBy === 'dueDate') {
        cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sort.sortBy === 'priority') {
        const order = { LOW: 0, HIGH: 1, CRITICAL: 2 };
        cmp = (order[a.priority] ?? 0) - (order[b.priority] ?? 0);
      } else if (sort.sortBy === 'status') {
        const order = { NOT_STARTED: 0, IN_PROGRESS: 1, COMPLETED: 2, CANCELLED: 3 };
        cmp = (order[a.status] ?? 0) - (order[b.status] ?? 0);
      }

      return sort.sortDir === 'asc' ? cmp : -cmp;
    });
  }
);


export const selectSelectedIds = createSelector(
  selectTodoState,
  state => state.selectedIds
);
