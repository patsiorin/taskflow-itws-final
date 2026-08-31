import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ColumnsService } from '../application/columns.service';
import { CreateColumnDto } from '../dto/create-column.dto';
import { ReorderColumnsDto } from '../dto/reorder-columns.dto';
import { UpdateColumnDto } from '../dto/update-column.dto';

// With the global /api prefix, this controller handles /api/columns routes.
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get()
  // Optional query example: /api/columns?boardId=1 filters columns by board.
  findAll(@Query('boardId') boardId?: string) {
    return this.columnsService.findAll(boardId ? Number(boardId) : undefined);
  }

  @Get(':id')
  // Route params arrive as strings; ParseIntPipe safely converts id to number.
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.columnsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateColumnDto) {
    return this.columnsService.create(data);
  }

  @Patch('reorder')
  // Saves the order of all columns for one board.
  reorder(@Body() data: ReorderColumnsDto) {
    return this.columnsService.reorder(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateColumnDto) {
    return this.columnsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.columnsService.remove(id);
  }
}
