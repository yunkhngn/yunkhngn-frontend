import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    async create(createBlogDto: CreateBlogDto) {
        return this.prisma.blog.create({
            data: createBlogDto,
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
        return this.prisma.blog.update({
            where: { id },
            data: updateBlogDto,
        });
    }

    async remove(id: string) {
        return this.prisma.blog.delete({
            where: { id },
        });
    }
}
