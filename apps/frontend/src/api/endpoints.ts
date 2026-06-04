export const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://127.0.0.1:3000/api';

export const endpoints = {
  boards: '/boards',
  boardById: (id: number) => `/boards/${id}`,
  columns: '/columns',
  columnById: (id: number) => `/columns/${id}`,
  columnsByBoard: (boardId: number) => `/columns?boardId=${boardId}`,
  tasks: '/tasks',
  taskById: (id: number) => `/tasks/${id}`,
  tasksByBoard: (boardId: number) => `/tasks?boardId=${boardId}`,
};
