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
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const newsletter_service_1 = require("../newsletter/newsletter.service");
let BlogService = class BlogService {
    constructor(prisma, newsletterService) {
        this.prisma = prisma;
        this.newsletterService = newsletterService;
    }
    async create(createBlogDto) {
        const existing = await this.prisma.blog.findUnique({
            where: { slug: createBlogDto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException('Slug already exists');
        }
        const { content, excerpt, ...rest } = createBlogDto;
        const data = {
            ...rest,
            contentJSON: rest.contentJSON || content,
            seoDescription: rest.seoDescription || excerpt,
        };
        console.log('Creating blog with data:', data);
        const newBlog = await this.prisma.blog.create({
            data,
        });
        if (newBlog.status === 'PUBLISHED') {
            console.log(`[BlogService] New blog published: ${newBlog.title}. Sending newsletter...`);
            await this.sendNewsletterForBlog(newBlog);
        }
        return newBlog;
    }
    async findAll() {
        return this.prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                tags: true,
                status: true,
                seoTitle: true,
                seoDescription: true,
                seoImage: true,
                imageSettings: true,
                views: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findOne(slugOrId) {
        const blog = await this.prisma.blog.findFirst({
            where: {
                OR: [{ slug: slugOrId }, { id: slugOrId }],
            },
            include: { comments: true },
        });
        if (!blog)
            return null;
        const relatedPosts = await this.findRelatedPosts(blog.id, blog.tags);
        return {
            ...blog,
            relatedPosts,
        };
    }
    async findRelatedPosts(currentId, tags) {
        let related = [];
        if (tags) {
            const tagList = tags.split(',').map((t) => t.trim());
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
    async update(id, updateBlogDto) {
        if (updateBlogDto.slug) {
            const existing = await this.prisma.blog.findUnique({
                where: { slug: updateBlogDto.slug },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Slug already exists');
            }
        }
        const currentBlog = await this.prisma.blog.findUnique({ where: { id } });
        const data = { ...updateBlogDto };
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
        console.log(`[BlogService] Updating blog ${id}...`);
        const updatedBlog = await this.prisma.blog.update({
            where: { id },
            data,
        });
        const wasPublished = currentBlog?.status === 'PUBLISHED';
        const isNowPublished = updatedBlog.status === 'PUBLISHED';
        if (!wasPublished && isNowPublished) {
            console.log(`[BlogService] Blog ${updatedBlog.title} just got PUBLISHED! Sending newsletter...`);
            await this.sendNewsletterForBlog(updatedBlog);
        }
        return updatedBlog;
    }
    async remove(id) {
        return this.prisma.blog.delete({
            where: { id },
        });
    }
    async incrementViews(slugOrId) {
        const blog = await this.findOne(slugOrId);
        if (!blog)
            return null;
        return this.prisma.blog.update({
            where: { id: blog.id },
            data: { views: { increment: 1 } },
        });
    }
    async sendNewsletterForBlog(blog) {
        try {
            const subject = `New Post: ${blog.title}`;
            const blogUrl = `${process.env.FRONTEND_URL}/blog/${blog.slug}`;
            const description = blog.seoDescription || 'Click to read full post...';
            const truncatedDescription = description.length > 200
                ? `${description.substring(0, 197)}...`
                : description;
            const content = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            ${blog.thumbnail
                ? `<div style="width: 100%; height: 200px; background-image: url('${blog.thumbnail}'); background-size: cover; background-position: center;"></div>`
                : ''}
            <div style="padding: 30px;">
              <h2 style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">New Blog Post</h2>
              <h1 style="font-size: 24px; font-weight: 700; margin: 10px 0 15px; line-height: 1.3;">
                <a href="${blogUrl}" style="text-decoration: none; color: #1a1a1a;">${blog.title}</a>
              </h1>
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                ${truncatedDescription}
              </p>
              <div style="text-align: center;">
                <a href="${blogUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Read Full Story</a>
              </div>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
              <p style="margin: 0;">You received this email because you subscribed to yunkhngn.dev.</p>
            </div>
          </div>
      `;
            await this.newsletterService.sendToAll(subject, content);
            console.log(`[BlogService] Newsletter sent for blog: ${blog.title}`);
        }
        catch (error) {
            console.error('[BlogService] Failed to send newsletter for blog:', blog.title, error);
        }
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        newsletter_service_1.NewsletterService])
], BlogService);
//# sourceMappingURL=blog.service.js.map