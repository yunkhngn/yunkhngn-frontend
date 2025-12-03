import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateReactionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['like', 'heart', 'cat', 'fire', 'laugh'])
  reactionType: string;
}
