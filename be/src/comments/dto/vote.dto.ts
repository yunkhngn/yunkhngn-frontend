import { IsNotEmpty, IsIn } from 'class-validator';

export class VoteDto {
    @IsNotEmpty()
    @IsIn([1, -1])
    value: number; // 1 = upvote, -1 = downvote
}
