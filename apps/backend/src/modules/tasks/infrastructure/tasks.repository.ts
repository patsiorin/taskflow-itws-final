import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

// TaskRepository contains the Prisma queries for tasks.
@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(boardId?: number) {
    return this.prisma.task.findMany({
      where: boardId ? { boardId } : undefined,
      // include joins related board and column data into the returned objects.
      include: { board: true, column: true },
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  findById(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
      // Return the task together with its parent board and column.
      include: { board: true, column: true },
    });
  }

  boardExists(boardId: number) {
    return this.prisma.board.findUnique({
      where: { id: boardId },
      // Only fetch id because this is an existence check.
      select: { id: true },
    });
  }

  columnForBoardExists(columnId: number, boardId: number) {
    // findFirst checks both id and boardId, proving the column belongs to the board.
    return this.prisma.boardColumn.findFirst({
      where: { id: columnId, boardId },
      select: { id: true },
    });
  }

  countForBoard(boardId: number, ids: number[]) {
    // Used by reorder to reject tasks from another board.
    return this.prisma.task.count({
      where: {
        boardId,
        id: { in: ids },
      },
    });
  }

  countColumnsForBoard(boardId: number, ids: number[]) {
    // Used by reorder to reject target columns from another board.
    return this.prisma.boardColumn.count({
      where: {
        boardId,
        id: { in: ids },
      },
    });
  }

  create(data: Prisma.TaskUncheckedCreateInput) {
    return this.prisma.task.create({ data });
  }

  update(id: number, data: Prisma.TaskUncheckedUpdateInput) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  reorder(items: Array<{ id: number; columnId: number; position: number }>) {
    // A task drag may change both its columnId and its position.
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.task.update({
          where: { id: item.id },
          data: {
            columnId: item.columnId,
            position: item.position,
          },
        }),
      ),
    );
  }

  delete(id: number) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
