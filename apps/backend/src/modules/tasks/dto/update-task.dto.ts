import { TaskPriority } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

// Update task fields are optional because PATCH may send only one changed field.
export class UpdateTaskDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  boardId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  columnId?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  // Keeps priority limited to the database enum values.
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
