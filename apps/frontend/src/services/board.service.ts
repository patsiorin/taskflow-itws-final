import { endpoints } from '@/api/endpoints';
import { httpClient } from '@/api/httpClient';
import type { Board, CreateBoardInput, UpdateBoardInput } from '@/types/board';

export class BoardService {
  static getBoards() {
    return httpClient<Board[]>(endpoints.boards);
  }

  static getBoard(id: number) {
    return httpClient<Board>(endpoints.boardById(id));
  }

  static createBoard(data: CreateBoardInput) {
    return httpClient<Board>(endpoints.boards, {
      method: 'POST',
      body: data,
    });
  }

  static updateBoard(id: number, data: UpdateBoardInput) {
    return httpClient<Board>(endpoints.boardById(id), {
      method: 'PATCH',
      body: data,
    });
  }

  static deleteBoard(id: number) {
    return httpClient<Board>(endpoints.boardById(id), {
      method: 'DELETE',
    });
  }
}

