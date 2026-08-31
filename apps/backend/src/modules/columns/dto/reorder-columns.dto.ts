import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

class ReorderColumnItemDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsInt()
  @Min(1)
  position!: number;
}

export class ReorderColumnsDto {
  @IsInt()
  @Min(1)
  boardId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderColumnItemDto)
  columns!: ReorderColumnItemDto[];
}
