import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/toast.model';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toast = signal<Toast | null>(null);

  show(message: string, type: Toast['type'] = 'info') {

    this.toast.set({
      message,
      type
    });

    setTimeout(() => {
      this.toast.set(null);
    }, 3000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }
}