import { IsHexColor, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

// DTO means "Data Transfer Object": the expected shape of a request body.
export class CreateBoardDto {
  // class-validator decorators are enforced by ValidationPipe in main.ts.
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

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
