import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { CommentVote } from './entities/comment-vote.entity';
import { CommentReport } from './entities/comment-report.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment, CommentVote, CommentReport]),
    ],
    controllers: [CommentsController],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule { }
