import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

// One column's new position inside a board.
class ReorderColumnItemDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsInt()
  @Min(1)
  position!: number;
}

export class ReorderColumnsDto {
  // The boardId scopes the reorder operation to one Kanban board.
  @IsInt()
  @Min(1)
  boardId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  // Required so nested column items get class-validator checks.
  @Type(() => ReorderColumnItemDto)
  columns!: ReorderColumnItemDto[];
}
