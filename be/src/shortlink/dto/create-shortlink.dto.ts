import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsDateString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateShortlinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Code can only contain letters, numbers, hyphens, and underscores',
  })
  code?: string;

  @IsString()
  @IsUrl({}, { message: 'Target URL must be a valid URL' })
  targetUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
