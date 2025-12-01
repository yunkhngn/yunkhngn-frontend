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
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(idOrSlug);

        if (isUuid) {
            const project = await this.prisma.project.findUnique({ where: { id: idOrSlug } });
            if (project) return project;
        }

        return this.prisma.project.findUnique({
            where: { slug: idOrSlug },
        });
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

        const { id: _id, createdAt, ...rest } = updateProjectDto as any;
        return this.prisma.project.update({
            where: { id },
            data: rest,
        });
    }

    async remove(id: string) {
        return this.prisma.project.delete({
            where: { id },
        });
    }
}
