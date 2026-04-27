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
exports.GalleryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let GalleryService = class GalleryService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async create(createGalleryDto) {
        return this.prisma.gallery.create({
            data: createGalleryDto,
        });
    }
    async findAll(query) {
        const page = query?.page || 1;
        const limit = query?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query?.albumId) {
            where.albumId = query.albumId;
        }
        if (query?.tag) {
            where.tags = { contains: query.tag };
        }
        const [data, total] = await Promise.all([
            this.prisma.gallery.findMany({
                where,
                orderBy: [{ createdAt: 'desc' }],
                skip,
                take: limit,
                select: {
                    id: true,
                    imageUrl: true,
                    caption: true,
                    albumId: true,
                    tags: true,
                    views: true,
                    sortOrder: true,
                    blurHash: true,
                    width: true,
                    height: true,
                    createdAt: true,
                    album: { select: { id: true, name: true, slug: true } },
                },
            }),
            this.prisma.gallery.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const photo = await this.prisma.gallery.findUnique({
            where: { id },
            include: { album: { select: { id: true, name: true, slug: true } } },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found');
        }
        return photo;
    }
    incrementViews(id) {
        this.prisma.gallery
            .update({ where: { id }, data: { views: { increment: 1 } } })
            .catch(() => { });
        return { success: true };
    }
    async update(id, data) {
        return this.prisma.gallery.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.gallery.delete({
            where: { id },
        });
    }
    async reorder(items) {
        const updates = items.map((item) => this.prisma.gallery.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
        }));
        await this.prisma.$transaction(updates);
        return { updated: items.length };
    }
    async bulkUpdate(ids, data) {
        const result = await this.prisma.gallery.updateMany({
            where: { id: { in: ids } },
            data,
        });
        return { updated: result.count };
    }
    async getAllTags() {
        const photos = await this.prisma.gallery.findMany({
            where: { tags: { not: null } },
            select: { tags: true },
        });
        const tagSet = new Set();
        photos.forEach((p) => {
            if (p.tags) {
                p.tags.split(',').forEach((t) => {
                    const trimmed = t.trim();
                    if (trimmed)
                        tagSet.add(trimmed);
                });
            }
        });
        return [...tagSet].sort();
    }
    getUploadSignature(folder) {
        return this.cloudinaryService.generateUploadSignature({
            folder: folder || 'blog-portfolio/gallery',
        });
    }
};
exports.GalleryService = GalleryService;
exports.GalleryService = GalleryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], GalleryService);
//# sourceMappingURL=gallery.service.js.map