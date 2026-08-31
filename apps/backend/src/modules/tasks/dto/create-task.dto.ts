import { TaskPriority } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

// Request body required to create a task card.
export class CreateTaskDto {
  // boardId and columnId are foreign keys.
  @IsInt()
  @Min(1)
  boardId!: number;

  @IsInt()
  @Min(1)
  columnId!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  // Priority must be one value from the Prisma enum: LOW, MEDIUM, or HIGH.
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
