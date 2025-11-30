import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService) { }

    async create(createProjectDto: CreateProjectDto) {
        return this.prisma.project.create({
            data: createProjectDto,
        });
    }

    async findAll() {
        return this.prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.project.findUnique({
            where: { id },
        });
    }

    async update(id: string, updateProjectDto: UpdateProjectDto) {
        return this.prisma.project.update({
            where: { id },
            data: updateProjectDto,
        });
    }

    async remove(id: string) {
        return this.prisma.project.delete({
            where: { id },
        });
    }
}
