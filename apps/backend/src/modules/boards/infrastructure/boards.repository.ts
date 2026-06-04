import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class BoardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {
    return this.prisma.board.findMany({
      include: { _count: { select: { columns: true, tasks: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.board.findUnique({
      where: { id },
      include: {
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

  delete(id: number) {
    return this.prisma.board.delete({
      where: { id },
    });
  }
}
