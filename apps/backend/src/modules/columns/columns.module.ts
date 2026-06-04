import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { ColumnsService } from './application/columns.service';
import { ColumnsRepository } from './infrastructure/columns.repository';
import { ColumnsController } from './presentation/columns.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ColumnsController],
  providers: [ColumnsService, ColumnsRepository],
})
export class ColumnsModule {}

