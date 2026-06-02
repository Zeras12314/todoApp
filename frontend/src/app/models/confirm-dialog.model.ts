
export interface ConfirmDialogData {
  hasCloseButton?: boolean;
  image?: string;
  title?: string;
  span?: string;
  message?: string;
  message2?: string;
  dialogAlign: 'start' | 'center' | 'end';
  confirmText?: string;
  cancelText?: string;
  confirmAsText?: boolean;
}
