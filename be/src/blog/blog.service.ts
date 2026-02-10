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

    const { content, excerpt, ...rest } = createBlogDto as any;
    const data = {
      ...rest,
      contentJSON: rest.contentJSON || content,
      seoDescription: rest.seoDescription || excerpt,
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
    const blog = await this.prisma.blog.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: { comments: true },
    });

    if (!blog) return null;

    const relatedPosts = await this.findRelatedPosts(blog.id, blog.tags);

    return {
      ...blog,
      relatedPosts,
    };
  }

  async findRelatedPosts(currentId: string, tags: string) {
    let related = [];
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      // Find posts that have at least one matching tag
      // Prisma doesn't support array-contains for string fields directly like this easily for broad searches without full text search
      // So we use OR with contains for each tag
      if (tagList.length > 0) {
        related = await this.prisma.blog.findMany({
          where: {
            id: { not: currentId },
            status: 'PUBLISHED',
            OR: tagList.map((tag) => ({
              tags: { contains: tag },
            })),
          },
          take: 2,
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    // If we have less than 2, fill with recent posts
    if (related.length < 2) {
      const existingIds = [currentId, ...related.map((b) => b.id)];
      const recent = await this.prisma.blog.findMany({
        where: {
          id: { notIn: existingIds },
          status: 'PUBLISHED',
        },
        take: 2 - related.length,
        orderBy: { createdAt: 'desc' },
      });
      related = [...related, ...recent];
    }

    return related;
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
    if (data.excerpt) {
      data.seoDescription = data.seoDescription || data.excerpt;
      delete data.excerpt;
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
