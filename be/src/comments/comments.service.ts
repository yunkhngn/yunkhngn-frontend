import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentVote } from './entities/comment-vote.entity';
import { CommentReport, ReportStatus } from './entities/comment-report.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteDto } from './dto/vote.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class CommentsService {
    private readonly rateLimitMap = new Map<string, number>();

    constructor(
        @InjectRepository(Comment)
        private commentsRepository: Repository<Comment>,
        @InjectRepository(CommentVote)
        private votesRepository: Repository<CommentVote>,
        @InjectRepository(CommentReport)
        private reportsRepository: Repository<CommentReport>,
    ) { }

    // Rate limiting: 1 comment per 10 seconds per UID
    private checkRateLimit(uid: string): void {
        const now = Date.now();
        const lastComment = this.rateLimitMap.get(uid);

        if (lastComment && now - lastComment < 10000) {
            throw new BadRequestException('You can only post one comment every 10 seconds');
        }

        this.rateLimitMap.set(uid, now);
    }

    async create(createCommentDto: CreateCommentDto, uid: string): Promise<Comment> {
        this.checkRateLimit(uid);

        const comment = this.commentsRepository.create({
            ...createCommentDto,
            uid,
        });

        return this.commentsRepository.save(comment);
    }

    async findAll(blogId: string): Promise<Comment[]> {
        return this.commentsRepository.find({
            where: { blogId, hidden: false },
            order: { createdAt: 'DESC' },
        });
    }

    async findAllIncludingHidden(blogId: string): Promise<Comment[]> {
        return this.commentsRepository.find({
            where: { blogId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Comment> {
        const comment = await this.commentsRepository.findOne({ where: { id } });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
    }

    async update(id: string, updateCommentDto: UpdateCommentDto, uid: string, isAdmin: boolean): Promise<Comment> {
        const comment = await this.findOne(id);

        // Only owner or admin can update
        if (comment.uid !== uid && !isAdmin) {
            throw new ForbiddenException('You can only edit your own comments');
        }

        Object.assign(comment, updateCommentDto);
        return this.commentsRepository.save(comment);
    }

    async remove(id: string, uid: string, isAdmin: boolean): Promise<void> {
        const comment = await this.findOne(id);

        // Only owner or admin can delete
        if (comment.uid !== uid && !isAdmin) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.commentsRepository.delete(id);
    }

    async hide(id: string): Promise<Comment> {
        const comment = await this.findOne(id);
        comment.hidden = true;
        return this.commentsRepository.save(comment);
    }

    async unhide(id: string): Promise<Comment> {
        const comment = await this.findOne(id);
        comment.hidden = false;
        return this.commentsRepository.save(comment);
    }

    // Voting logic
    async vote(commentId: string, voteDto: VoteDto, uid: string): Promise<Comment> {
        const comment = await this.findOne(commentId);
        const existingVote = await this.votesRepository.findOne({
            where: { commentId, uid },
        });

        if (existingVote) {
            // If same vote value, remove vote
            if (existingVote.value === voteDto.value) {
                await this.votesRepository.delete(existingVote.id);

                // Update counts
                if (voteDto.value === 1) {
                    comment.upvoteCount = Math.max(0, comment.upvoteCount - 1);
                } else {
                    comment.downvoteCount = Math.max(0, comment.downvoteCount - 1);
                }
            } else {
                // Switch vote
                const oldValue = existingVote.value;
                existingVote.value = voteDto.value;
                await this.votesRepository.save(existingVote);

                // Update counts
                if (oldValue === 1) {
                    comment.upvoteCount = Math.max(0, comment.upvoteCount - 1);
                    comment.downvoteCount += 1;
                } else {
                    comment.downvoteCount = Math.max(0, comment.downvoteCount - 1);
                    comment.upvoteCount += 1;
                }
            }
        } else {
            // Create new vote
            const vote = this.votesRepository.create({
                commentId,
                uid,
                value: voteDto.value,
            });
            await this.votesRepository.save(vote);

            // Update counts
            if (voteDto.value === 1) {
                comment.upvoteCount += 1;
            } else {
                comment.downvoteCount += 1;
            }
        }

        return this.commentsRepository.save(comment);
    }

    async getUserVote(commentId: string, uid: string): Promise<CommentVote | null> {
        return this.votesRepository.findOne({ where: { commentId, uid } });
    }

    async getUserVotes(commentIds: string[], uid: string): Promise<CommentVote[]> {
        if (commentIds.length === 0) return [];
        return this.votesRepository.find({
            where: commentIds.map(id => ({ commentId: id, uid })),
        });
    }

    // Reporting logic
    async report(commentId: string, reportDto: ReportCommentDto, reporterUid: string): Promise<CommentReport> {
        await this.findOne(commentId); // Verify comment exists

        // Check if already reported
        const existingReport = await this.reportsRepository.findOne({
            where: { commentId, reporterUid },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this comment');
        }

        const report = this.reportsRepository.create({
            commentId,
            reporterUid,
            reason: reportDto.reason,
        });

        return this.reportsRepository.save(report);
    }

    async getReports(status?: ReportStatus): Promise<CommentReport[]> {
        const where = status ? { status } : {};
        return this.reportsRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }

    async updateReportStatus(id: string, updateReportDto: UpdateReportDto): Promise<CommentReport> {
        const report = await this.reportsRepository.findOne({ where: { id } });
        if (!report) {
            throw new NotFoundException('Report not found');
        }

        report.status = updateReportDto.status;
        return this.reportsRepository.save(report);
    }
}
