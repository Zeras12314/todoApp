export interface Todo {
  id: number;
  title: string;
  priority: string;
  status: string;
  dueDate: Date;
  createdDate: Date;
  description?: string;
}
