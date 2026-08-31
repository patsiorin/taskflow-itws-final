import { endpoints } from '@/api/endpoints';
import { httpClient } from '@/api/httpClient';
import type { BoardColumn, CreateColumnInput, ReorderColumnInput, UpdateColumnInput } from '@/types/board';

export class ColumnService {
  static getColumns(boardId?: number) {
    return httpClient<BoardColumn[]>(boardId ? endpoints.columnsByBoard(boardId) : endpoints.columns);
  }

  static getColumn(id: number) {
    return httpClient<BoardColumn>(endpoints.columnById(id));
  }

  static createColumn(data: CreateColumnInput) {
    return httpClient<BoardColumn>(endpoints.columns, {
      method: 'POST',
      body: data,
    });
  }

  static updateColumn(id: number, data: UpdateColumnInput) {
    return httpClient<BoardColumn>(endpoints.columnById(id), {
      method: 'PATCH',
      body: data,
    });
  }

  static reorderColumns(boardId: number, columns: ReorderColumnInput[]) {
    return httpClient<BoardColumn[]>(endpoints.columnsReorder, {
      method: 'PATCH',
      body: { boardId, columns },
    });
  }

  static deleteColumn(id: number) {
    return httpClient<BoardColumn>(endpoints.columnById(id), {
      method: 'DELETE',
    });
  }
}
