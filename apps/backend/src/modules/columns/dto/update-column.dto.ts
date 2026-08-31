import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

// All fields are optional because PATCH updates only supplied fields.
export class UpdateColumnDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  boardId?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
