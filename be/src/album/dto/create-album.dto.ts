import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAlbumDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    coverPhotoId?: string;
}
