import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteDto } from './dto/vote.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateReportDto } from './dto/update-report.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(createCommentDto: CreateCommentDto, req: any): Promise<any>;
    findAll(blogId?: string, projectId?: string, includeHidden?: string, page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
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
    update(id: string, updateCommentDto: UpdateCommentDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<void>;
    hide(id: string, req: any): Promise<{
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
    unhide(id: string, req: any): Promise<{
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
    vote(id: string, voteDto: VoteDto, req: any): Promise<any>;
    getUserVote(id: string, req: any): Promise<{
        id: string;
        uid: string;
        createdAt: Date;
        updatedAt: Date;
        value: number;
        commentId: string;
    }>;
    getUserVotes(commentIds: string[], req: any): Promise<{
        id: string;
        uid: string;
        createdAt: Date;
        updatedAt: Date;
        value: number;
        commentId: string;
    }[]>;
    report(id: string, reportDto: ReportCommentDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        reporterUid: string;
        commentId: string;
    }>;
    getReports(status?: string, page?: number, limit?: number, req?: any): Promise<{
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
    updateReportStatus(id: string, updateReportDto: UpdateReportDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        reporterUid: string;
        commentId: string;
    }>;
    deleteReport(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        reason: string;
        reporterUid: string;
        commentId: string;
    }>;
}
