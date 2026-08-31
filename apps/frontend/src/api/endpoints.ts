export const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://127.0.0.1:3000/api';

export const endpoints = {
  boards: '/boards',
  boardsReorder: '/boards/reorder',
  boardById: (id: number) => `/boards/${id}`,
  columns: '/columns',
  columnsReorder: '/columns/reorder',
  columnById: (id: number) => `/columns/${id}`,
  columnsByBoard: (boardId: number) => `/columns?boardId=${boardId}`,
  tasks: '/tasks',
  tasksReorder: '/tasks/reorder',
  taskById: (id: number) => `/tasks/${id}`,
  tasksByBoard: (boardId: number) => `/tasks?boardId=${boardId}`,
};
