import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentService {
    constructor(private prisma: PrismaService) { }

    async create(createCommentDto: CreateCommentDto) {
        return this.prisma.comment.create({
            data: createCommentDto,
        });
    }

    async findAll(blogId: string) {
        return this.prisma.comment.findMany({
            where: { blogId, hidden: false },
            orderBy: { createdAt: 'desc' },
        });
    }

    async remove(id: string, uid: string, isAdmin: boolean) {
        // If admin, can delete any comment.
        // If user, can only delete their own comment.
        if (isAdmin) {
            return this.prisma.comment.delete({ where: { id } });
        }
        return this.prisma.comment.deleteMany({
            where: { id, uid },
        });
    }

    async hide(id: string) {
        return this.prisma.comment.update({
            where: { id },
            data: { hidden: true },
        });
    }
}
