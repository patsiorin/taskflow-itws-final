import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class ColumnsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(boardId?: number) {
    return this.prisma.boardColumn.findMany({
      where: boardId ? { boardId } : undefined,
      include: { _count: { select: { tasks: true } } },
      orderBy: [{ boardId: 'asc' }, { position: 'asc' }],
    });
  }

  findById(id: number) {
    return this.prisma.boardColumn.findUnique({
      where: { id },
      include: { tasks: { orderBy: { position: 'asc' } } },
    });
  }

  boardExists(boardId: number) {
    return this.prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true },
    });
  }

  countForBoard(boardId: number, ids: number[]) {
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
