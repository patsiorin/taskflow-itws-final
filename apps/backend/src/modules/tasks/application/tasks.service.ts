import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksRepository } from '../infrastructure/tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  findAll(boardId?: number) {
    return this.tasksRepository.findMany(boardId);
  }

  async findOne(id: number) {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(data: CreateTaskDto) {
    await this.ensureBoardExists(data.boardId);
    await this.ensureColumnBelongsToBoard(data.columnId, data.boardId);
    return this.tasksRepository.create(this.toCreateRepositoryData(data));
  }

  async update(id: number, data: UpdateTaskDto) {
    const task = await this.findOne(id);
    const boardId = data.boardId ?? task.boardId;
    const columnId = data.columnId ?? task.columnId;

    if (data.boardId) {
      await this.ensureBoardExists(data.boardId);
    }

    if (data.boardId || data.columnId) {
      await this.ensureColumnBelongsToBoard(columnId, boardId);
    }

    return this.tasksRepository.update(id, this.toUpdateRepositoryData(data));
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.tasksRepository.delete(id);
  }

  private toCreateRepositoryData(data: CreateTaskDto): Prisma.TaskUncheckedCreateInput {
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
  }

  private toUpdateRepositoryData(data: UpdateTaskDto): Prisma.TaskUncheckedUpdateInput {
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
  }

  private async ensureBoardExists(boardId: number) {
    const board = await this.tasksRepository.boardExists(boardId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }
  }

  private async ensureColumnBelongsToBoard(columnId: number, boardId: number) {
    const column = await this.tasksRepository.columnForBoardExists(columnId, boardId);

    if (!column) {
      throw new NotFoundException('Column not found for board');
    }
  }
}
