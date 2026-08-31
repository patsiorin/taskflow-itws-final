import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

// ColumnRepository contains the Prisma queries for board_columns.
@Injectable()
export class ColumnsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(boardId?: number) {
    return this.prisma.boardColumn.findMany({
      // where is omitted when no boardId filter is provided.
      where: boardId ? { boardId } : undefined,
      // _count returns the number of tasks in each column.
      include: { _count: { select: { tasks: true } } },
      orderBy: [{ boardId: 'asc' }, { position: 'asc' }],
    });
  }

  findById(id: number) {
    return this.prisma.boardColumn.findUnique({
      where: { id },
      // Load tasks with the column so a single-column view can show its cards.
      include: { tasks: { orderBy: { position: 'asc' } } },
    });
  }

  boardExists(boardId: number) {
    return this.prisma.board.findUnique({
      where: { id: boardId },
      // select limits the returned data to just id.
      select: { id: true },
    });
  }

  countForBoard(boardId: number, ids: number[]) {
    // Count matching rows to verify every requested column belongs to this board.
    return this.prisma.boardColumn.count({
      where: {
        boardId,
        id: { in: ids },
      },
    });
  }

  create(data: Prisma.BoardColumnUncheckedCreateInput) {
    return this.prisma.boardColumn.create({ data });
  }

  update(id: number, data: Prisma.BoardColumnUncheckedUpdateInput) {
    return this.prisma.boardColumn.update({
      where: { id },
      data,
    });
  }

  reorder(items: Array<{ id: number; position: number }>) {
    // Save all positions atomically after column drag-and-drop.
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.boardColumn.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );
  }

  delete(id: number) {
    return this.prisma.boardColumn.delete({
      where: { id },
    });
  }
}
