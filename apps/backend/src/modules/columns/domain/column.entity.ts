// Domain type for a Kanban column row.
export type ColumnEntity = {
  id: number;
  boardId: number;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};
