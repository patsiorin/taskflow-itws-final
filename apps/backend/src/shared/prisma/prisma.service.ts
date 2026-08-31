import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// PrismaService adapts PrismaClient to NestJS dependency injection and lifecycle hooks.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Open the database connection when Nest starts this provider.
    await this.$connect();
  }

  async onModuleDestroy() {
    // Close the database connection cleanly when the app shuts down.
    await this.$disconnect();
  }
}
