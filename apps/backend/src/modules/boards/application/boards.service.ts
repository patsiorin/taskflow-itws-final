import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from '../dto/create-board.dto';
import { ReorderBoardsDto } from '../dto/reorder-boards.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { BoardsRepository } from '../infrastructure/boards.repository';

// Services contain business rules and keep controllers thin.
@Injectable()
export class BoardsService {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  findAll() {
    return this.boardsRepository.findMany();
  }

  async findOne(id: number) {
    const board = await this.boardsRepository.findById(id);

    if (!board) {
      // NestJS converts this exception to an HTTP 404 response.
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  create(data: CreateBoardDto) {
    return this.boardsRepository.create({
      name: data.name,
      description: data.description,
      color: data.color,
      position: data.position,
    });
  }

  async update(id: number, data: UpdateBoardDto) {
    // Check existence first so the API returns a controlled 404 message.
    await this.findOne(id);
    return this.boardsRepository.update(id, data);
  }

  reorder(data: ReorderBoardsDto) {
    // The frontend sends id + position pairs; the repository persists them.
    return this.boardsRepository.reorder(data.boards);
  }

  async remove(id: number) {
    // Cascade delete in Prisma/database removes this board's columns and tasks.
    await this.findOne(id);
    return this.boardsRepository.delete(id);
  }
}
