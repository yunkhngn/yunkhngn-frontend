import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShortlinkDto } from './dto/create-shortlink.dto';
import { UpdateShortlinkDto } from './dto/update-shortlink.dto';

@Injectable()
export class ShortlinkService {
    constructor(private prisma: PrismaService) { }

    private generateCode(length = 6): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async create(dto: CreateShortlinkDto) {
        let code = dto.code;

        if (!code) {
            // Auto-generate a unique code
            let attempts = 0;
            do {
                code = this.generateCode();
                const existing = await this.prisma.shortLink.findUnique({ where: { code } });
                if (!existing) break;
                attempts++;
            } while (attempts < 10);

            if (attempts >= 10) {
                throw new ConflictException('Failed to generate a unique code. Please provide one manually.');
            }
        } else {
            const existing = await this.prisma.shortLink.findUnique({ where: { code } });
            if (existing) {
                throw new ConflictException('This code is already in use');
            }
        }

        return this.prisma.shortLink.create({
            data: {
                code,
                targetUrl: dto.targetUrl,
                title: dto.title,
                isActive: dto.isActive ?? true,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            },
        });
    }

    async findAll() {
        return this.prisma.shortLink.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async resolve(code: string) {
        const link = await this.prisma.shortLink.findUnique({ where: { code } });

        if (!link) {
            throw new NotFoundException('Shortlink not found');
        }

        if (!link.isActive) {
            throw new NotFoundException('This shortlink is no longer active');
        }

        if (link.expiresAt && new Date() > link.expiresAt) {
            throw new NotFoundException('This shortlink has expired');
        }

        // Increment clicks asynchronously (fire-and-forget)
        this.prisma.shortLink
            .update({ where: { id: link.id }, data: { clicks: { increment: 1 } } })
            .catch(() => { });

        return { targetUrl: link.targetUrl };
    }

    async update(id: string, dto: UpdateShortlinkDto) {
        const existing = await this.prisma.shortLink.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Shortlink not found');
        }

        if (dto.code && dto.code !== existing.code) {
            const codeInUse = await this.prisma.shortLink.findUnique({ where: { code: dto.code } });
            if (codeInUse) {
                throw new ConflictException('This code is already in use');
            }
        }

        const data: any = { ...dto };
        if (data.expiresAt) {
            data.expiresAt = new Date(data.expiresAt);
        }

        return this.prisma.shortLink.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        const existing = await this.prisma.shortLink.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Shortlink not found');
        }

        return this.prisma.shortLink.delete({ where: { id } });
    }

    async bulkDelete(ids: string[]) {
        const result = await this.prisma.shortLink.deleteMany({
            where: { id: { in: ids } },
        });
        return { deleted: result.count };
    }

    async bulkUpdateStatus(ids: string[], isActive: boolean) {
        const result = await this.prisma.shortLink.updateMany({
            where: { id: { in: ids } },
            data: { isActive },
        });
        return { updated: result.count };
    }
}
