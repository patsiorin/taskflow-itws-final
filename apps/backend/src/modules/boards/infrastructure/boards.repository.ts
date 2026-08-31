import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

// Repositories keep Prisma/database code out of controllers and services.
@Injectable()
export class BoardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {
    return this.prisma.board.findMany({
      // _count returns relation counts without loading every column/task row.
      include: { _count: { select: { columns: true, tasks: true } } },
      orderBy: [{ position: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  findById(id: number) {
    return this.prisma.board.findUnique({
      where: { id },
      include: {
        // include loads related columns; the nested include loads each column's tasks.
        columns: {
          include: { tasks: { orderBy: { position: 'asc' } } },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  create(data: Prisma.BoardCreateInput) {
    return this.prisma.board.create({ data });
  }

  update(id: number, data: Prisma.BoardUpdateInput) {
    return this.prisma.board.update({
      where: { id },
      data,
    });
  }

  reorder(items: Array<{ id: number; position: number }>) {
    // $transaction makes all position updates succeed or fail together.
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.board.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );
  }

  delete(id: number) {
    return this.prisma.board.delete({
      where: { id },
    });
  }
}
