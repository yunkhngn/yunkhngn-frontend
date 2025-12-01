import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateCommentDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    content?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    displayName?: string;
}
