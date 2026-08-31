import { IsHexColor, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

// Update DTO fields are optional because PATCH can update only part of a board.
export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
