"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sanitizeHtml = require("sanitize-html");
const settings_service_1 = require("../settings/settings.service");
const notifications_service_1 = require("../notifications/notifications.service");
let CommentsService = class CommentsService {
    constructor(prisma, settingsService, notificationsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
        this.notificationsService = notificationsService;
        this.rateLimitMap = new Map();
    }
    checkRateLimit(uid) {
        const now = Date.now();
        const lastComment = this.rateLimitMap.get(uid);
        if (lastComment && now - lastComment < 10000) {
            throw new common_1.BadRequestException('You can only post one comment every 10 seconds');
        }
        this.rateLimitMap.set(uid, now);
    }
    async create(createCommentDto, uid) {
        this.checkRateLimit(uid);
        if (!createCommentDto.blogId && !createCommentDto.projectId) {
            throw new Error('Either blogId or projectId must be provided');
        }
        const cleanContent = sanitizeHtml(createCommentDto.content, {
            allowedTags: [],
            allowedAttributes: {},
        });
        if (cleanContent.trim().length === 0) {
            throw new common_1.BadRequestException('Comment cannot be empty');
        }
        if (/([.?!])\1{3,}/.test(cleanContent)) {
            throw new common_1.BadRequestException('Too many repeated punctuation marks');
        }
        if (/(.)\1{9,}/.test(cleanContent)) {
            throw new common_1.BadRequestException('Too many repeated characters');
        }
        const settings = await this.settingsService.getSettings();
        const forbiddenSetting = settings.find((s) => s.settingTitle === 'comment_forbidden_keywords');
        if (forbiddenSetting && forbiddenSetting.content) {
            const keywords = forbiddenSetting.content
                .split(',')
                .map((k) => k.trim())
                .filter((k) => k);
            const lowerContent = cleanContent.toLowerCase();
            for (const keyword of keywords) {
                if (lowerContent.includes(keyword.toLowerCase())) {
                    throw new common_1.BadRequestException('Comment contains forbidden keywords');
                }
            }
        }
        const comment = await this.prisma.comment.create({
            data: {
                ...createCommentDto,
                content: cleanContent,
                uid,
            },
        });
        let notificationLink = '/admin/comments';
        if (createCommentDto.blogId) {
            const blog = await this.prisma.blog.findUnique({
                where: { id: createCommentDto.blogId },
                select: { slug: true },
            });
            if (blog) {
                notificationLink = `/blog/${blog.slug}#comment-${comment.id}`;
            }
        }
        else if (createCommentDto.projectId) {
            notificationLink = `/project/${createCommentDto.projectId}#comment-${comment.id}`;
        }
        this.notificationsService
            .create('COMMENT', `New comment from ${createCommentDto.displayName}: ${cleanContent.substring(0, 50)}...`, notificationLink)
            .catch((err) => console.error('Failed to send real-time notification:', err));
        return this.attachUserDetails([comment]).then((comments) => comments[0]);
    }
    async findAll(blogId, projectId, page = 1, limit = 100) {
        const skip = (page - 1) * limit;
        const where = { hidden: false, deleted: false };
        if (blogId) {
            where.blogId = blogId;
        }
        if (projectId) {
            where.projectId = projectId;
        }
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.comment.count({ where }),
        ]);
        const data = await this.attachUserDetails(comments);
        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
    async findAllIncludingHidden(blogId, projectId, page = 1, limit = 100) {
        const skip = (page - 1) * limit;
        const where = { deleted: false };
        if (blogId) {
            where.blogId = blogId;
        }
        if (projectId) {
            where.projectId = projectId;
        }
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    blog: {
                        select: {
                            title: true,
                            slug: true,
                        },
                    },
                    project: {
                        select: {
                            title: true,
                            slug: true,
                        },
                    },
                },
                skip,
                take: limit,
            }),
            this.prisma.comment.count({ where }),
        ]);
        const data = await this.attachUserDetails(comments);
        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
    async attachUserDetails(comments) {
        if (comments.length === 0)
            return [];
        const uids = [...new Set(comments.map((c) => c.uid))];
        const users = await this.prisma.user.findMany({
            where: { uid: { in: uids } },
            select: { uid: true, role: true, avatarUrl: true, name: true },
        });
        const userMap = new Map(users.map((u) => [u.uid, u]));
        return comments.map((comment) => ({
            ...comment,
            user: userMap.get(comment.uid) || null,
        }));
    }
    async findOne(id) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        return comment;
    }
    async update(id, updateCommentDto, uid, isAdmin) {
        const comment = await this.findOne(id);
        if (comment.uid !== uid && !isAdmin) {
            throw new common_1.ForbiddenException('You can only edit your own comments');
        }
        return this.prisma.comment.update({
            where: { id },
            data: updateCommentDto,
        });
    }
    async remove(id, uid, isAdmin) {
        const comment = await this.findOne(id);
        if (comment.uid !== uid && !isAdmin) {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        await this.prisma.comment.update({
            where: { id },
            data: { deleted: true },
        });
        if (isAdmin) {
            await this.prisma.commentReport.updateMany({
                where: { commentId: id },
                data: { status: 'resolved' },
            });
        }
    }
    async hide(id) {
        return this.prisma.comment.update({
            where: { id },
            data: { hidden: true },
        });
    }
    async unhide(id) {
        return this.prisma.comment.update({
            where: { id },
            data: { hidden: false },
        });
    }
    async vote(commentId, voteDto, uid) {
        const comment = await this.findOne(commentId);
        const existingVote = await this.prisma.commentVote.findUnique({
            where: { commentId_uid: { commentId, uid } },
        });
        if (existingVote) {
            if (existingVote.value === voteDto.value) {
                await this.prisma.commentVote.delete({
                    where: { id: existingVote.id },
                });
                const updateData = voteDto.value === 1
                    ? { upvoteCount: { decrement: 1 } }
                    : { downvoteCount: { decrement: 1 } };
                const updatedComment = await this.prisma.comment.update({
                    where: { id: commentId },
                    data: updateData,
                });
                const [commentWithUser] = await this.attachUserDetails([
                    updatedComment,
                ]);
                return commentWithUser;
            }
            else {
                await this.prisma.commentVote.update({
                    where: { id: existingVote.id },
                    data: { value: voteDto.value },
                });
                const updateData = existingVote.value === 1
                    ? { upvoteCount: { decrement: 1 }, downvoteCount: { increment: 1 } }
                    : {
                        downvoteCount: { decrement: 1 },
                        upvoteCount: { increment: 1 },
                    };
                const updatedComment = await this.prisma.comment.update({
                    where: { id: commentId },
                    data: updateData,
                });
                const [commentWithUser] = await this.attachUserDetails([
                    updatedComment,
                ]);
                return commentWithUser;
            }
        }
        else {
            await this.prisma.commentVote.create({
                data: {
                    commentId,
                    uid,
                    value: voteDto.value,
                },
            });
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
    async getUserVote(commentId, uid) {
        return this.prisma.commentVote.findUnique({
            where: { commentId_uid: { commentId, uid } },
        });
    }
    async getUserVotes(commentIds, uid) {
        if (commentIds.length === 0)
            return [];
        return this.prisma.commentVote.findMany({
            where: {
                commentId: { in: commentIds },
                uid,
            },
        });
    }
    async report(commentId, reportDto, reporterUid) {
        await this.findOne(commentId);
        const existingReport = await this.prisma.commentReport.findUnique({
            where: { commentId_reporterUid: { commentId, reporterUid } },
        });
        if (existingReport) {
            throw new common_1.BadRequestException('You have already reported this comment');
        }
        return this.prisma.commentReport.create({
            data: {
                commentId,
                reporterUid,
                reason: reportDto.reason,
            },
        });
    }
    async getReports(status, page = 1, limit = 100) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};
        const [reports, total] = await Promise.all([
            this.prisma.commentReport.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    comment: {
                        select: {
                            id: true,
                            content: true,
                            displayName: true,
                            blogId: true,
                            projectId: true,
                            blog: {
                                select: {
                                    title: true,
                                    slug: true,
                                },
                            },
                            project: {
                                select: {
                                    title: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
                skip,
                take: limit,
            }),
            this.prisma.commentReport.count({ where }),
        ]);
        return {
            data: reports,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
    async updateReportStatus(id, updateReportDto) {
        const report = await this.prisma.commentReport.findUnique({
            where: { id },
        });
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return this.prisma.commentReport.update({
            where: { id },
            data: { status: updateReportDto.status },
        });
    }
    async deleteReport(id) {
        return this.prisma.commentReport.delete({
            where: { id },
        });
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService,
        notifications_service_1.NotificationsService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map