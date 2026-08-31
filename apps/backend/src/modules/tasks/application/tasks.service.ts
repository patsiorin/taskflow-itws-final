import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ReorderTasksDto } from '../dto/reorder-tasks.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksRepository } from '../infrastructure/tasks.repository';

// TaskService protects task rules before data is written to the database.
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
    // A task must belong to an existing board and to a column inside that board.
    await this.ensureBoardExists(data.boardId);
    await this.ensureColumnBelongsToBoard(data.columnId, data.boardId);
    return this.tasksRepository.create(this.toCreateRepositoryData(data));
  }

  async update(id: number, data: UpdateTaskDto) {
    const task = await this.findOne(id);
    // Keep current values when PATCH does not provide boardId or columnId.
    const boardId = data.boardId ?? task.boardId;
    const columnId = data.columnId ?? task.columnId;

    if (data.boardId) {
      await this.ensureBoardExists(data.boardId);
    }

    if (data.boardId || data.columnId) {
      // This prevents moving a task into a column from a different board.
      await this.ensureColumnBelongsToBoard(columnId, boardId);
    }

    return this.tasksRepository.update(id, this.toUpdateRepositoryData(data));
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.tasksRepository.delete(id);
  }

  async reorder(data: ReorderTasksDto) {
    await this.ensureBoardExists(data.boardId);

    const taskIds = data.tasks.map((task) => task.id);
    const columnIds = [...new Set(data.tasks.map((task) => task.columnId))];
    // Both counts must match so every moved task/column belongs to this board.
    const matchingTasksCount = await this.tasksRepository.countForBoard(data.boardId, taskIds);
    const matchingColumnsCount = await this.tasksRepository.countColumnsForBoard(data.boardId, columnIds);

    if (matchingTasksCount !== taskIds.length) {
      throw new NotFoundException('Task not found for board');
    }

    if (matchingColumnsCount !== columnIds.length) {
      throw new NotFoundException('Column not found for board');
    }

    return this.tasksRepository.reorder(data.tasks);
  }

  private toCreateRepositoryData(data: CreateTaskDto): Prisma.TaskUncheckedCreateInput {
    return {
      ...data,
      // Prisma expects Date objects for DateTime columns, while HTTP sends strings.
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
  }

  private toUpdateRepositoryData(data: UpdateTaskDto): Prisma.TaskUncheckedUpdateInput {
    return {
      ...data,
      // undefined means "do not update this field" for Prisma.
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
