import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(boardId?: number) {
    return this.prisma.task.findMany({
      where: boardId ? { boardId } : undefined,
      include: { board: true, column: true },
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  findById(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { board: true, column: true },
    });
  }

  boardExists(boardId: number) {
    return this.prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true },
    });
  }

  columnForBoardExists(columnId: number, boardId: number) {
    return this.prisma.boardColumn.findFirst({
      where: { id: columnId, boardId },
      select: { id: true },
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

  delete(id: number) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
