import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

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

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsString()
  @IsOptional()
  seoImage?: string;

  @IsString()
  @IsOptional()
  imageSettings?: string; // JSON: { desktop: {x,y}, mobile: {x,y}, seo: {x,y} }
}
