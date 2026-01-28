import { Injectable, ConflictException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(createBlogDto: CreateBlogDto) {
    const existing = await this.prisma.blog.findUnique({
      where: { slug: createBlogDto.slug },
    });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }

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

  async findOne(slugOrId: string) {
    return this.prisma.blog.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: { comments: true },
    });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    if (updateBlogDto.slug) {
      const existing = await this.prisma.blog.findUnique({
        where: { slug: updateBlogDto.slug },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Slug already exists');
      }
    }

    const data = { ...updateBlogDto } as any;
    if (data.content) {
      data.contentJSON = data.contentJSON || data.content;
      delete data.content;
    }
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.comments;
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

  async incrementViews(slugOrId: string) {
    const blog = await this.findOne(slugOrId);
    if (!blog) return null;

    return this.prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    });
  }
}
