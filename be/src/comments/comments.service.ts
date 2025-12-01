import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteDto } from './dto/vote.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class CommentsService {
    private readonly rateLimitMap = new Map<string, number>();

    constructor(private prisma: PrismaService) { }

    // Rate limiting: 1 comment per 10 seconds per UID
    private checkRateLimit(uid: string): void {
        const now = Date.now();
        const lastComment = this.rateLimitMap.get(uid);

        if (lastComment && now - lastComment < 10000) {
            throw new BadRequestException('You can only post one comment every 10 seconds');
        }

        this.rateLimitMap.set(uid, now);
    }

    async create(createCommentDto: CreateCommentDto, uid: string) {
        this.checkRateLimit(uid);

        const comment = await this.prisma.comment.create({
            data: {
                ...createCommentDto,
                uid,
            },
        });

        const [commentWithUser] = await this.attachUserDetails([comment]);
        return commentWithUser;
    }

    async findAll(blogId?: string) {
        const where: any = { hidden: false };
        if (blogId) {
            where.blogId = blogId;
        }

        const comments = await this.prisma.comment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return this.attachUserDetails(comments);
    }

    async findAllIncludingHidden(blogId?: string) {
        const where: any = {};
        if (blogId) {
            where.blogId = blogId;
        }

        const comments = await this.prisma.comment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                blog: {
                    select: {
                        title: true,
                        slug: true,
                    }
                }
            }
        });

        return this.attachUserDetails(comments);
    }

    private async attachUserDetails(comments: any[]) {
        if (comments.length === 0) return [];

        const uids = [...new Set(comments.map(c => c.uid))];
        const users = await this.prisma.user.findMany({
            where: { uid: { in: uids } },
            select: { uid: true, role: true, avatarUrl: true, name: true }
        });

        const userMap = new Map(users.map(u => [u.uid, u]));

        return comments.map(comment => ({
            ...comment,
            user: userMap.get(comment.uid) || null
        }));
    }

    async findOne(id: string) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
    }

    async update(id: string, updateCommentDto: UpdateCommentDto, uid: string, isAdmin: boolean) {
        const comment = await this.findOne(id);

        // Only owner or admin can update
        if (comment.uid !== uid && !isAdmin) {
            throw new ForbiddenException('You can only edit your own comments');
        }

        return this.prisma.comment.update({
            where: { id },
            data: updateCommentDto,
        });
    }

    async remove(id: string, uid: string, isAdmin: boolean) {
        const comment = await this.findOne(id);

        // Only owner or admin can delete
        if (comment.uid !== uid && !isAdmin) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.prisma.comment.delete({ where: { id } });
    }

    async hide(id: string) {
        return this.prisma.comment.update({
            where: { id },
            data: { hidden: true },
        });
    }

    async unhide(id: string) {
        return this.prisma.comment.update({
            where: { id },
            data: { hidden: false },
        });
    }

    // Voting logic
    async vote(commentId: string, voteDto: VoteDto, uid: string) {
        const comment = await this.findOne(commentId);
        const existingVote = await this.prisma.commentVote.findUnique({
            where: { commentId_uid: { commentId, uid } },
        });

        if (existingVote) {
            // If same vote value, remove vote
            if (existingVote.value === voteDto.value) {
                await this.prisma.commentVote.delete({
                    where: { id: existingVote.id },
                });

                // Update counts
                const updateData = voteDto.value === 1
                    ? { upvoteCount: { decrement: 1 } }
                    : { downvoteCount: { decrement: 1 } };

                const updatedComment = await this.prisma.comment.update({
                    where: { id: commentId },
                    data: updateData,
                });

                const [commentWithUser] = await this.attachUserDetails([updatedComment]);
                return commentWithUser;
            } else {
                // Switch vote
                await this.prisma.commentVote.update({
                    where: { id: existingVote.id },
                    data: { value: voteDto.value },
                });

                // Update counts
                const updateData = existingVote.value === 1
                    ? { upvoteCount: { decrement: 1 }, downvoteCount: { increment: 1 } }
                    : { downvoteCount: { decrement: 1 }, upvoteCount: { increment: 1 } };

                const updatedComment = await this.prisma.comment.update({
                    where: { id: commentId },
                    data: updateData,
                });

                const [commentWithUser] = await this.attachUserDetails([updatedComment]);
                return commentWithUser;
            }
        } else {
            // Create new vote
            await this.prisma.commentVote.create({
                data: {
                    commentId,
                    uid,
                    value: voteDto.value,
                },
            });

            // Update counts
            const updateData = voteDto.value === 1
                ? { upvoteCount: { increment: 1 } }
                : { downvoteCount: { increment: 1 } };

            const updatedComment = await this.prisma.comment.update({
                where: { id: commentId },
                data: updateData,
            });

            const [commentWithUser] = await this.attachUserDetails([updatedComment]);
            return commentWithUser;
        }
    }

    async getUserVote(commentId: string, uid: string) {
        return this.prisma.commentVote.findUnique({
            where: { commentId_uid: { commentId, uid } },
        });
    }

    async getUserVotes(commentIds: string[], uid: string) {
        if (commentIds.length === 0) return [];
        return this.prisma.commentVote.findMany({
            where: {
                commentId: { in: commentIds },
                uid,
            },
        });
    }

    // Reporting logic
    async report(commentId: string, reportDto: ReportCommentDto, reporterUid: string) {
        await this.findOne(commentId); // Verify comment exists

        // Check if already reported
        const existingReport = await this.prisma.commentReport.findUnique({
            where: { commentId_reporterUid: { commentId, reporterUid } },
        });

        if (existingReport) {
            throw new BadRequestException('You have already reported this comment');
        }

        return this.prisma.commentReport.create({
            data: {
                commentId,
                reporterUid,
                reason: reportDto.reason,
            },
        });
    }

    async getReports(status?: string) {
        const where = status ? { status } : {};
        return this.prisma.commentReport.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                comment: {
                    select: {
                        id: true,
                        content: true,
                        displayName: true,
                        blogId: true,
                    },
                },
            },
        });
    }

    async updateReportStatus(id: string, updateReportDto: UpdateReportDto) {
        const report = await this.prisma.commentReport.findUnique({ where: { id } });
        if (!report) {
            throw new NotFoundException('Report not found');
        }

        return this.prisma.commentReport.update({
            where: { id },
            data: { status: updateReportDto.status },
        });
    }
}
