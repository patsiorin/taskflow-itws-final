import { endpoints } from '@/api/endpoints';
import { httpClient } from '@/api/httpClient';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/types/task';

export class TaskService {
  static getTasks(boardId?: number) {
    return httpClient<Task[]>(boardId ? endpoints.tasksByBoard(boardId) : endpoints.tasks);
  }

  static getTask(id: number) {
    return httpClient<Task>(endpoints.taskById(id));
  }

  static createTask(data: CreateTaskInput) {
    return httpClient<Task>(endpoints.tasks, {
      method: 'POST',
      body: data,
    });
  }

  static updateTask(id: number, data: UpdateTaskInput) {
    return httpClient<Task>(endpoints.taskById(id), {
      method: 'PATCH',
      body: data,
    });
  }

  static deleteTask(id: number) {
    return httpClient<Task>(endpoints.taskById(id), {
      method: 'DELETE',
    });
  }
}

