export interface Todo {
  id: number;
  title: string;
  priority: string;
  status: string;
  dueDate: Date;
  createdDate: Date;
  completedDate?: Date;
  description?: string;
  subTasks?: SubTask[];
}

export interface SubTask {
  id?: number;
  title: string;
  completed: boolean;
}