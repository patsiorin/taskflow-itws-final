import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from '../dto/create-column.dto';
import { ReorderColumnsDto } from '../dto/reorder-columns.dto';
import { UpdateColumnDto } from '../dto/update-column.dto';
import { ColumnsRepository } from '../infrastructure/columns.repository';

// ColumnService owns rules that are more than a simple database query.
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
    // A column cannot exist without a valid parent board.
    await this.ensureBoardExists(data.boardId);
    return this.columnsRepository.create(data);
  }

  async update(id: number, data: UpdateColumnDto) {
    await this.findOne(id);

    if (data.boardId) {
      // If a column is moved to another board, validate the target board first.
      await this.ensureBoardExists(data.boardId);
    }

    return this.columnsRepository.update(id, data);
  }

  async reorder(data: ReorderColumnsDto) {
    await this.ensureBoardExists(data.boardId);

    const columnIds = data.columns.map((column) => column.id);
    // This prevents clients from reordering columns that belong to another board.
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
    // Only the id is selected because we just need to know if the row exists.
    const board = await this.columnsRepository.boardExists(boardId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }
  }
}
