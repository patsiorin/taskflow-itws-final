import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from '../dto/create-column.dto';
import { ReorderColumnsDto } from '../dto/reorder-columns.dto';
import { UpdateColumnDto } from '../dto/update-column.dto';
import { ColumnsRepository } from '../infrastructure/columns.repository';

@Injectable()
export class ColumnsService {
  constructor(private readonly columnsRepository: ColumnsRepository) {}

  findAll(boardId?: number) {
    return this.columnsRepository.findMany(boardId);
  }

  async findOne(id: number) {
    const column = await this.columnsRepository.findById(id);

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return column;
  }

  async create(data: CreateColumnDto) {
    await this.ensureBoardExists(data.boardId);
    return this.columnsRepository.create(data);
  }

  async update(id: number, data: UpdateColumnDto) {
    await this.findOne(id);

    if (data.boardId) {
      await this.ensureBoardExists(data.boardId);
    }

    return this.columnsRepository.update(id, data);
  }

  async reorder(data: ReorderColumnsDto) {
    await this.ensureBoardExists(data.boardId);

    const columnIds = data.columns.map((column) => column.id);
    const matchingColumnsCount = await this.columnsRepository.countForBoard(data.boardId, columnIds);

    if (matchingColumnsCount !== columnIds.length) {
      throw new NotFoundException('Column not found for board');
    }

    return this.columnsRepository.reorder(data.columns);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.columnsRepository.delete(id);
  }

  private async ensureBoardExists(boardId: number) {
    const board = await this.columnsRepository.boardExists(boardId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }
  }
}
