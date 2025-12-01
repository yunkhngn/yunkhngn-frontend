import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { VoteDto } from './dto/vote.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    @UseGuards(FirebaseAuthGuard)
    create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
        return this.commentsService.create(createCommentDto, req.user.uid);
    }

    @Get()
    findAll(
        @Query('blogId') blogId?: string,
        @Query('projectId') projectId?: string,
        @Query('includeHidden') includeHidden?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 100,
    ) {
        if (includeHidden === 'true') {
            return this.commentsService.findAllIncludingHidden(blogId, projectId, +page, +limit);
        }
        return this.commentsService.findAll(blogId, projectId, +page, +limit);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.commentsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(FirebaseAuthGuard)
    update(
        @Param('id') id: string,
        @Body() updateCommentDto: UpdateCommentDto,
        @Request() req,
    ) {
        return this.commentsService.update(
            id,
            updateCommentDto,
            req.user.uid,
            req.user.isAdmin || false,
        );
    }

    @Delete(':id')
    @UseGuards(FirebaseAuthGuard)
    remove(@Param('id') id: string, @Request() req) {
        return this.commentsService.remove(
            id,
            req.user.uid,
            req.user.isAdmin || false,
        );
    }

    @Post(':id/hide')
    @UseGuards(FirebaseAuthGuard)
    hide(@Param('id') id: string, @Request() req) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can hide comments');
        }
        return this.commentsService.hide(id);
    }

    @Post(':id/unhide')
    @UseGuards(FirebaseAuthGuard)
    unhide(@Param('id') id: string, @Request() req) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can unhide comments');
        }
        return this.commentsService.unhide(id);
    }

    @Post(':id/vote')
    @UseGuards(FirebaseAuthGuard)
    vote(@Param('id') id: string, @Body() voteDto: VoteDto, @Request() req) {
        return this.commentsService.vote(id, voteDto, req.user.uid);
    }

    @Get(':id/vote')
    @UseGuards(FirebaseAuthGuard)
    getUserVote(@Param('id') id: string, @Request() req) {
        return this.commentsService.getUserVote(id, req.user.uid);
    }

    @Post('votes/batch')
    @UseGuards(FirebaseAuthGuard)
    getUserVotes(@Body('commentIds') commentIds: string[], @Request() req) {
        return this.commentsService.getUserVotes(commentIds, req.user.uid);
    }

    @Post(':id/report')
    @UseGuards(FirebaseAuthGuard)
    report(
        @Param('id') id: string,
        @Body() reportDto: ReportCommentDto,
        @Request() req,
    ) {
        return this.commentsService.report(id, reportDto, req.user.uid);
    }

    @Get('admin/reports')
    @UseGuards(FirebaseAuthGuard)
    getReports(
        @Query('status') status?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 100,
        @Request() req?
    ) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can view reports');
        }
        return this.commentsService.getReports(status, +page, +limit);
    }

    @Patch('admin/reports/:id')
    @UseGuards(FirebaseAuthGuard)
    updateReportStatus(
        @Param('id') id: string,
        @Body() updateReportDto: UpdateReportDto,
        @Request() req,
    ) {
        if (!req.user.isAdmin) {
            throw new Error('Only admins can update report status');
        }
        return this.commentsService.updateReportStatus(id, updateReportDto);
    }
}
