import { Module } from '@nestjs/common';
import { BoardsModule } from './modules/boards/boards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { TasksModule } from './modules/tasks/tasks.module';

// The root module connects all feature modules into one NestJS application.
@Module({
  imports: [BoardsModule, ColumnsModule, TasksModule],
})
export class AppModule {}
