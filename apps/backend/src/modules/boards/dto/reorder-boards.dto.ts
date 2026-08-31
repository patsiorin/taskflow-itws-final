import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

// One item in the drag-and-drop order payload.
class ReorderBoardItemDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsInt()
  @Min(1)
  position!: number;
}

export class ReorderBoardsDto {
  @IsArray()
  @ArrayMinSize(1)
  // ValidateNested checks every object inside the boards array.
  @ValidateNested({ each: true })
  // @Type tells class-transformer what class each nested object should become.
  @Type(() => ReorderBoardItemDto)
  boards!: ReorderBoardItemDto[];
}
