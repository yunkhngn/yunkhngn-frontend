import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';

export class CreateJournalDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  mood?: string; // happy, coffee, coding, productive, love, fire, tired, chill, rainy, music, inspired, reading

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}
