import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

// One task's new column and position after drag-and-drop.
class ReorderTaskItemDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsInt()
  @Min(1)
  columnId!: number;

  @IsInt()
  @Min(1)
  position!: number;
}

export class ReorderTasksDto {
  // Scope the reorder request to one board for safer validation.
  @IsInt()
  @Min(1)
  boardId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  // Needed so nested task items are transformed and validated as DTO objects.
  @Type(() => ReorderTaskItemDto)
  tasks!: ReorderTaskItemDto[];
}
