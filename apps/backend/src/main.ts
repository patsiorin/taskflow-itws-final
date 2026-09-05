import { join } from 'path';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

config({ path: join(__dirname, '..', '.env'), override: true, quiet: true });

async function bootstrap() {
  // NestFactory creates the HTTP application from the root module graph.
  const app = await NestFactory.create(AppModule);

  // Every controller route is served below /api, for example /api/boards.
  app.setGlobalPrefix('api');
  // CORS allows the Vite frontend to call the backend during local development.
  app.enableCors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      // Remove fields that are not declared in DTO classes.
      whitelist: true,
      // Convert simple incoming values to DTO types when possible.
      transform: true,
    }),
  );

  // PORT can come from .env; 3000 is the local fallback.
  await app.listen(process.env.PORT ?? 3000, '127.0.0.1');
}

bootstrap();
