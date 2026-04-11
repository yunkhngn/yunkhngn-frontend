import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createGalleryDto: CreateGalleryDto) {
    return this.prisma.gallery.create({
      data: createGalleryDto,
    });
  }

  async findAll(query?: {
    albumId?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
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

  async findById(id: string) {
    const photo = await this.prisma.gallery.findUnique({
      where: { id },
      include: { album: { select: { id: true, name: true, slug: true } } },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return photo;
  }

  incrementViews(id: string) {
    this.prisma.gallery
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => {});
    return { success: true };
  }

  async update(
    id: string,
    data: {
      caption?: string;
      albumId?: string;
      tags?: string;
      exifData?: string;
      blurHash?: string;
      sortOrder?: number;
      width?: number;
      height?: number;
    },
  ) {
    return this.prisma.gallery.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.gallery.delete({
      where: { id },
    });
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    const updates = items.map((item) =>
      this.prisma.gallery.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );
    await this.prisma.$transaction(updates);
    return { updated: items.length };
  }

  async bulkUpdate(
    ids: string[],
    data: {
      caption?: string;
      albumId?: string;
      tags?: string;
    },
  ) {
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

    const tagSet = new Set<string>();
    photos.forEach((p) => {
      if (p.tags) {
        p.tags.split(',').forEach((t) => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });

    return [...tagSet].sort();
  }

  getUploadSignature(folder?: string) {
    return this.cloudinaryService.generateUploadSignature({
      folder: folder || 'blog-portfolio/gallery',
    });
  }
}
