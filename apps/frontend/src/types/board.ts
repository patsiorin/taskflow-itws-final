import type { Task } from './task';

export type BoardColumn = {
  id: number;
  boardId: number;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
};

export type Board = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  columns?: BoardColumn[];
  tasks?: Task[];
  _count?: {
    columns: number;
    tasks: number;
  };
};

export type CreateBoardInput = {
  name: string;
  description?: string;
  color?: string;
};

export type UpdateBoardInput = Partial<CreateBoardInput>;

export type CreateColumnInput = {
  boardId: number;
  name: string;
  position?: number;
};

export type UpdateColumnInput = Partial<CreateColumnInput>;
