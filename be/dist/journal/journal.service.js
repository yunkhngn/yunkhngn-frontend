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
exports.JournalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let JournalService = class JournalService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createJournalDto) {
        const { tags, ...rest } = createJournalDto;
        const journal = await this.prisma.journal.create({
            data: {
                ...rest,
                tags: tags ? JSON.stringify(tags) : null,
                images: rest.images ? JSON.stringify(rest.images) : null,
            },
        });
        return this.formatEntry(journal);
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            this.prisma.journal.findMany({
                where: { parentId: null },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    reactions: true,
                    replies: {
                        orderBy: { createdAt: 'asc' },
                        include: { reactions: true },
                    },
                },
            }),
            this.prisma.journal.count({ where: { parentId: null } }),
        ]);
        return {
            data: entries.map((entry) => this.formatEntry(entry)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const entry = await this.prisma.journal.findUnique({
            where: { id },
            include: {
                reactions: true,
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: { reactions: true },
                },
            },
        });
        if (!entry)
            return null;
        return this.formatEntry(entry);
    }
    async update(id, updateJournalDto) {
        const { tags, ...rest } = updateJournalDto;
        const data = { ...rest };
        if (tags !== undefined) {
            data.tags = tags ? JSON.stringify(tags) : null;
        }
        if (rest.images !== undefined) {
            data.images = rest.images ? JSON.stringify(rest.images) : null;
        }
        const entry = await this.prisma.journal.update({
            where: { id },
            data,
            include: { reactions: true, replies: { include: { reactions: true } } },
        });
        return this.formatEntry(entry);
    }
    async remove(id) {
        const children = await this.prisma.journal.findMany({
            where: { parentId: id },
        });
        for (const child of children) {
            await this.remove(child.id);
        }
        return this.prisma.journal.delete({
            where: { id },
        });
    }
    async toggleReaction(journalId, uid, type) {
        const existing = await this.prisma.journalReaction.findUnique({
            where: {
                journalId_uid: { journalId, uid },
            },
        });
        if (existing) {
            if (existing.type === type) {
                await this.prisma.journalReaction.delete({
                    where: { id: existing.id },
                });
                return { action: 'removed', type };
            }
            else {
                await this.prisma.journalReaction.update({
                    where: { id: existing.id },
                    data: { type },
                });
                return { action: 'updated', type };
            }
        }
        else {
            await this.prisma.journalReaction.create({
                data: { journalId, uid, type },
            });
            return { action: 'created', type };
        }
    }
    formatEntry(entry) {
        const formatted = {
            ...entry,
            tags: entry.tags ? JSON.parse(entry.tags) : [],
            images: entry.images ? JSON.parse(entry.images) : [],
        };
        if (entry.replies) {
            formatted.replies = entry.replies.map((r) => this.formatEntry(r));
        }
        return formatted;
    }
};
exports.JournalService = JournalService;
exports.JournalService = JournalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JournalService);
//# sourceMappingURL=journal.service.js.map