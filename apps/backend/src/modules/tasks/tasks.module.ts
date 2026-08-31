import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TasksService } from './application/tasks.service';
import { TasksRepository } from './infrastructure/tasks.repository';
import { TasksController } from './presentation/tasks.controller';

// TaskModule wires task HTTP routes to task business logic and Prisma access.
@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
})
export class TasksModule {}
