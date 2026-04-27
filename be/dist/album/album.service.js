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
exports.AlbumService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AlbumService = class AlbumService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    async create(dto) {
        const slug = dto.slug || this.generateSlug(dto.name);
        const existing = await this.prisma.album.findUnique({ where: { slug } });
        if (existing) {
            throw new common_1.ConflictException('An album with this slug already exists');
        }
        return this.prisma.album.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                coverPhotoId: dto.coverPhotoId,
            },
        });
    }
    async findAll() {
        const albums = await this.prisma.album.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: { select: { photos: true } },
            },
        });
        return albums.map((album) => ({
            ...album,
            photoCount: album._count.photos,
            _count: undefined,
        }));
    }
    async findBySlug(slug) {
        const album = await this.prisma.album.findUnique({
            where: { slug },
            include: {
                photos: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
        if (!album) {
            throw new common_1.NotFoundException('Album not found');
        }
        return album;
    }
    async update(id, dto) {
        const existing = await this.prisma.album.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Album not found');
        }
        if (dto.slug && dto.slug !== existing.slug) {
            const slugInUse = await this.prisma.album.findUnique({
                where: { slug: dto.slug },
            });
            if (slugInUse) {
                throw new common_1.ConflictException('This slug is already in use');
            }
        }
        return this.prisma.album.update({
            where: { id },
            data: {
                ...dto,
                slug: dto.slug || (dto.name ? this.generateSlug(dto.name) : undefined),
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.album.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Album not found');
        }
        await this.prisma.gallery.updateMany({
            where: { albumId: id },
            data: { albumId: null },
        });
        return this.prisma.album.delete({ where: { id } });
    }
};
exports.AlbumService = AlbumService;
exports.AlbumService = AlbumService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlbumService);
//# sourceMappingURL=album.service.js.map