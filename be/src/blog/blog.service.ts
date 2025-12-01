import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    async create(createBlogDto: CreateBlogDto) {
        const { content, ...rest } = createBlogDto as any;
        const data = {
            ...rest,
            contentJSON: rest.contentJSON || content,
        };
        return this.prisma.blog.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(slug: string) {
        return this.prisma.blog.findUnique({
            where: { slug },
            include: { comments: true },
        });
    }

    async update(id: string, updateBlogDto: UpdateBlogDto) {
        const { content, id: _id, createdAt, updatedAt, comments, ...rest } = updateBlogDto as any;
        const data = {
            ...rest,
            contentJSON: rest.contentJSON || content,
        };
        return this.prisma.blog.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.blog.delete({
            where: { id },
        });
    }
}
