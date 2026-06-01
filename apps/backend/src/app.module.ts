import { Module } from '@nestjs/common';
import { BoardsModule } from './modules/boards/boards.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [BoardsModule, TasksModule],
})
export class AppModule {}

