import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { BoardsRepository } from '../infrastructure/boards.repository';

@Injectable()
export class BoardsService {
  constructor(private readonly boardsRepository: BoardsRepository) {}

  findAll() {
    return this.boardsRepository.findMany();
  }

  async findOne(id: number) {
    const board = await this.boardsRepository.findById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  create(data: CreateBoardDto) {
    return this.boardsRepository.create({
      name: data.name,
      description: data.description,
      color: data.color,
    });
  }

  async update(id: number, data: UpdateBoardDto) {
    await this.findOne(id);
    return this.boardsRepository.update(id, data);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.boardsRepository.delete(id);
  }
}

