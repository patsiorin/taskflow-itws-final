import type { Task } from './task';

export type Board = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
};

export type CreateBoardInput = {
  name: string;
  description?: string;
  color?: string;
};

export type UpdateBoardInput = Partial<CreateBoardInput>;

