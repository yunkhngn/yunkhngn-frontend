import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsNotEmpty()
  settingTitle: string;

  @IsString()
  @IsOptional()
  content?: string;
}
