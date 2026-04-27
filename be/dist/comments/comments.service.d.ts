import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteDto } from './dto/vote.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { SettingsService } from '../settings/settings.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CommentsService {
    private prisma;
    private settingsService;
    private notificationsService;
    private readonly rateLimitMap;
    constructor(prisma: PrismaService, settingsService: SettingsService, notificationsService: NotificationsService);
    private checkRateLimit;
    create(createCommentDto: CreateCommentDto, uid: string): Promise<any>;
    findAll(blogId?: string, projectId?: string, page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findAllIncludingHidden(blogId?: string, projectId?: string, page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    private attachUserDetails;
    findOne(id: string): Promise<{
        id: string;
        uid: string;
        createdAt: Date;
        content: string;
        updatedAt: Date;
        displayName: string | null;
        hidden: boolean;
        deleted: boolean;
        upvoteCount: number;
        downvoteCount: number;
        blogId: string | null;
        projectId: string | null;
    }>;
    update(id: string, updateCommentDto: UpdateCommentDto, uid: string, isAdmin: boolean): Promise<{
        id: string;
        uid: string;
        createdAt: Date;
        content: string;
        updatedAt: Date;
        displayName: string | null;
        hidden: boolean;
        deleted: boolean;
        upvoteCount: number;
        downvoteCount: number;
        blogId: string | null;
        projectId: string | null;
    }>;
    remove(id: string, uid: string, isAdmin: boolean): Promise<void>;
    hide(id: string): Promise<{
        id: string;
        uid: string;
        createdAt: Date;
        content: string;
        updatedAt: Date;
        displayName: string | null;
        hidden: boolean;
        deleted: boolean;
        upvoteCount: number;
        downvoteCount: number;
        blogId: string | null;
        projectId: string | null;
    }>;
    unhide(id: string): Promise<{
        id: string;
        uid: string;
        createdAt: Date;
        content: string;
        updatedAt: Date;
        displayName: string | null;
        hidden: boolean;
        deleted: boolean;
        upvoteCount: number;
        downvoteCount: number;
        blogId: string | null;
        projectId: string | null;
    }>;
    vote(commentId: string, voteDto: VoteDto, uid: string): Promise<any>;
    getUserVote(commentId: string, uid: string): Promise<{
        id: string;
        uid: string;
        createdAt: Date;
        updatedAt: Date;
        value: number;
        commentId: string;
    }>;
    getUserVotes(commentIds: string[], uid: string): Promise<{
        id: string;
        uid: string;
        createdAt: Date;
        updatedAt: Date;
        value: number;
        commentId: string;
    }[]>;
    report(commentId: string, reportDto: ReportCommentDto, reporterUid: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        reporterUid: string;
        commentId: string;
    }>;
    getReports(status?: string, page?: number, limit?: number): Promise<{
        data: ({
            comment: {
                blog: {
                    title: string;
                    slug: string;
                };
                project: {
                    title: string;
                    slug: string;
                };
                id: string;
                content: string;
                displayName: string;
                blogId: string;
                projectId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            reason: string;
            reporterUid: string;
            commentId: string;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    updateReportStatus(id: string, updateReportDto: UpdateReportDto): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        reporterUid: string;
        commentId: string;
    }>;
    deleteReport(id: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        reporterUid: string;
        commentId: string;
    }>;
}
