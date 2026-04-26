import { PartialType } from '@nestjs/mapped-types';
import { CreateLetterDto } from './create-letter.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateLetterDto extends PartialType(CreateLetterDto) {
  @IsOptional()
  @IsBoolean()
  removePassword?: boolean;
}
