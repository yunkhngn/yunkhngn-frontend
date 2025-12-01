import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

export enum ReportStatus {
    PENDING = 'pending',
    RESOLVED = 'resolved',
    DISMISSED = 'dismissed',
}

@Entity('comment_reports')
@Unique(['commentId', 'reporterUid'])
@Index(['commentId'])
@Index(['reporterUid'])
@Index(['status'])
export class CommentReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    commentId: string;

    @Column()
    reporterUid: string;

    @Column('text')
    reason: string;

    @Column({
        type: 'varchar',
        enum: ReportStatus,
        default: ReportStatus.PENDING,
    })
    status: ReportStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
