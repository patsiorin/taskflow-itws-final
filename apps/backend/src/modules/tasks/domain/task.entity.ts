// String union that mirrors the Prisma TaskPriority enum.
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// Domain type for a Kanban task card.
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
