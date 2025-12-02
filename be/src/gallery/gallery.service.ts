import { Injectable } from '@nestjs/common';
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

  async findAll() {
    return this.prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.gallery.delete({
      where: { id },
    });
  }

  async update(id: string, data: { caption?: string }) {
    return this.prisma.gallery.update({
      where: { id },
      data,
    });
  }

  getUploadSignature(folder?: string) {
    return this.cloudinaryService.generateUploadSignature({
      folder: folder || 'blog-portfolio/gallery',
    });
  }
}
