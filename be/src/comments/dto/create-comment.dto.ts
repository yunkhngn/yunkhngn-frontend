import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  blogId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  displayName: string;
}
