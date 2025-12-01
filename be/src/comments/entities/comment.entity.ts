import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('comments')
@Index(['blogId'])
@Index(['uid'])
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    blogId: string;

    @Column()
    uid: string;

    @Column()
    displayName: string;

    @Column('text')
    content: string;

    @Column({ default: false })
    hidden: boolean;

    @Column({ default: 0 })
    upvoteCount: number;

    @Column({ default: 0 })
    downvoteCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
