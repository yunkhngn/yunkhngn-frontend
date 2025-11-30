import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post()
    @UseGuards(ThrottlerGuard, FirebaseAuthGuard)
    create(@Body() createCommentDto: CreateCommentDto) {
        return this.commentService.create(createCommentDto);
    }

    @Get()
    findAll(@Query('blogId') blogId: string) {
        return this.commentService.findAll(blogId);
    }

    @Delete(':id')
    @UseGuards(FirebaseAuthGuard)
    remove(@Param('id') id: string, @Req() req: any) {
        // Check if user is admin or owner
        // In a real app, we'd check req.user.role or similar from the decoded token
        // For now, let's assume if they pass the guard, they are authenticated.
        // We need to pass the uid to the service to verify ownership if not admin.
        const uid = req.user?.uid;
        const isAdmin = req.user?.role === 'ADMIN' || req.user?.email === 'admin@example.com'; // Simplified check
        return this.commentService.remove(id, uid, !!isAdmin);
    }
}
