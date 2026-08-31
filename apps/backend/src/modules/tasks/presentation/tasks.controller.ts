import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { TasksService } from '../application/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ReorderTasksDto } from '../dto/reorder-tasks.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query('boardId') boardId?: string) {
    return this.tasksService.findAll(boardId ? Number(boardId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateTaskDto) {
    return this.tasksService.create(data);
  }

  @Patch('reorder')
  reorder(@Body() data: ReorderTasksDto) {
    return this.tasksService.reorder(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateTaskDto) {
    return this.tasksService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
