import { Injectable, ConflictException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) { }

  async create(createProjectDto: CreateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: { slug: createProjectDto.slug },
    });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }

    return this.prisma.project.create({
      data: createProjectDto,
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
    });

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    if (updateProjectDto.slug) {
      const existing = await this.prisma.project.findUnique({
        where: { slug: updateProjectDto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Slug already exists');
      }
    }

    const data = { ...updateProjectDto } as Record<string, any>;
    delete data.id;
    delete data.createdAt;

    return this.prisma.project.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
