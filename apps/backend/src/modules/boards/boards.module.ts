import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { BoardsService } from './application/boards.service';
import { BoardsRepository } from './infrastructure/boards.repository';
import { BoardsController } from './presentation/boards.controller';

// A feature module groups one business area: routes, logic, and database access.
@Module({
  imports: [PrismaModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardsRepository],
  exports: [BoardsService],
})
export class BoardsModule {}
