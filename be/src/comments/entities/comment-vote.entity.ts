import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('comment_votes')
@Unique(['commentId', 'uid'])
@Index(['commentId'])
@Index(['uid'])
export class CommentVote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    commentId: string;

    @Column()
    uid: string;

    @Column({ type: 'int' }) // 1 = upvote, -1 = downvote
    value: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
