import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

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
  @IsInt()
  @Min(1)
  boardId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderTaskItemDto)
  tasks!: ReorderTaskItemDto[];
}
