export interface Todo {
  id: number;
  title: string;
  priority: string;
  status: string;
  dueDate: Date;
  createdDate?: Date;
  completedDate?: Date;
  description?: string;
  subTasks?: SubTask[];
  attachments?: TodoAttachment[]; 
}

export interface SubTask {
  id?: number;
  title: string;
  completed: boolean;
}

export interface TodoAttachment {
  id?: number;
  fileName: string;
  fileType?: string;
  filePath: string;
  fileSize?: number;
}