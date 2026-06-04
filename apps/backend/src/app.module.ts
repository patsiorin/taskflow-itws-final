import { Module } from '@nestjs/common';
import { BoardsModule } from './modules/boards/boards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [BoardsModule, ColumnsModule, TasksModule],
})
export class AppModule {}
