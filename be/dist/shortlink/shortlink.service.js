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
exports.ShortlinkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ShortlinkService = class ShortlinkService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    async create(dto) {
        let code = dto.code;
        if (!code) {
            let attempts = 0;
            do {
                code = this.generateCode();
                const existing = await this.prisma.shortLink.findUnique({
                    where: { code },
                });
                if (!existing)
                    break;
                attempts++;
            } while (attempts < 10);
            if (attempts >= 10) {
                throw new common_1.ConflictException('Failed to generate a unique code. Please provide one manually.');
            }
        }
        else {
            const existing = await this.prisma.shortLink.findUnique({
                where: { code },
            });
            if (existing) {
                throw new common_1.ConflictException('This code is already in use');
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
    async resolve(code) {
        const link = await this.prisma.shortLink.findUnique({ where: { code } });
        if (!link) {
            throw new common_1.NotFoundException('Shortlink not found');
        }
        if (!link.isActive) {
            throw new common_1.NotFoundException('This shortlink is no longer active');
        }
        if (link.expiresAt && new Date() > link.expiresAt) {
            throw new common_1.NotFoundException('This shortlink has expired');
        }
        this.prisma.shortLink
            .update({ where: { id: link.id }, data: { clicks: { increment: 1 } } })
            .catch(() => { });
        return { targetUrl: link.targetUrl };
    }
    async update(id, dto) {
        const existing = await this.prisma.shortLink.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Shortlink not found');
        }
        if (dto.code && dto.code !== existing.code) {
            const codeInUse = await this.prisma.shortLink.findUnique({
                where: { code: dto.code },
            });
            if (codeInUse) {
                throw new common_1.ConflictException('This code is already in use');
            }
        }
        const data = { ...dto };
        if (data.expiresAt) {
            data.expiresAt = new Date(data.expiresAt);
        }
        return this.prisma.shortLink.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        const existing = await this.prisma.shortLink.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Shortlink not found');
        }
        return this.prisma.shortLink.delete({ where: { id } });
    }
    async bulkDelete(ids) {
        const result = await this.prisma.shortLink.deleteMany({
            where: { id: { in: ids } },
        });
        return { deleted: result.count };
    }
    async bulkUpdateStatus(ids, isActive) {
        const result = await this.prisma.shortLink.updateMany({
            where: { id: { in: ids } },
            data: { isActive },
        });
        return { updated: result.count };
    }
};
exports.ShortlinkService = ShortlinkService;
exports.ShortlinkService = ShortlinkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShortlinkService);
//# sourceMappingURL=shortlink.service.js.map