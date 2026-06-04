export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaskEntity = {
  id: number;
  boardId: number;
  columnId: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: Date | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};
