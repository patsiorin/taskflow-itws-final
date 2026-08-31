export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Task = {
  id: number;
  boardId: number;
  columnId: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  boardId: number;
  columnId: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  position?: number;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type ReorderTaskInput = {
  id: number;
  columnId: number;
  position: number;
};
