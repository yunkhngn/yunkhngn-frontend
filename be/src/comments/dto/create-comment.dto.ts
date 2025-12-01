import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    blogId: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    content: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    displayName: string;
}
