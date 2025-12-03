import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  techStack?: string;

  @IsString()
  @IsOptional()
  repoLink?: string;

  @IsString()
  @IsOptional()
  demoLink?: string;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  tags?: string; // JSON string or comma-separated

  @IsString()
  @IsNotEmpty()
  contentJSON: string;

  @IsEnum(['DRAFT', 'PUBLISHED'])
  @IsOptional()
  status?: string; // 'DRAFT' | 'PUBLISHED'
}
