import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGalleryDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  caption?: string;
}
