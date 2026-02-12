import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumService {
    constructor(private prisma: PrismaService) { }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    async create(dto: CreateAlbumDto) {
        const slug = dto.slug || this.generateSlug(dto.name);

        const existing = await this.prisma.album.findUnique({ where: { slug } });
        if (existing) {
            throw new ConflictException('An album with this slug already exists');
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

        return albums.map(album => ({
            ...album,
            photoCount: album._count.photos,
            _count: undefined,
        }));
    }

    async findBySlug(slug: string) {
        const album = await this.prisma.album.findUnique({
            where: { slug },
            include: {
                photos: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        if (!album) {
            throw new NotFoundException('Album not found');
        }

        return album;
    }

    async update(id: string, dto: UpdateAlbumDto) {
        const existing = await this.prisma.album.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Album not found');
        }

        if (dto.slug && dto.slug !== existing.slug) {
            const slugInUse = await this.prisma.album.findUnique({ where: { slug: dto.slug } });
            if (slugInUse) {
                throw new ConflictException('This slug is already in use');
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

    async remove(id: string) {
        const existing = await this.prisma.album.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Album not found');
        }

        // Unassign photos from this album first
        await this.prisma.gallery.updateMany({
            where: { albumId: id },
            data: { albumId: null },
        });

        return this.prisma.album.delete({ where: { id } });
    }
}
