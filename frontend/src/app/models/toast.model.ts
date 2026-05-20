// src/app/models/toast.model.ts
export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
