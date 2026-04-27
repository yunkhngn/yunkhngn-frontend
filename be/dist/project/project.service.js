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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectService = class ProjectService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProjectDto) {
        const existing = await this.prisma.project.findUnique({
            where: { slug: createProjectDto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException('Slug already exists');
        }
        const data = { ...createProjectDto };
        if (data.link) {
            data.demoLink = data.link;
            delete data.link;
        }
        if (data.images) {
            try {
                const parsed = JSON.parse(data.images);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    data.cover = parsed[0];
                }
            }
            catch {
            }
            delete data.images;
        }
        return this.prisma.project.create({
            data,
        });
    }
    async findAll() {
        return this.prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(idOrSlug) {
        const project = await this.prisma.project.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
        });
        return project;
    }
    async update(id, updateProjectDto) {
        if (updateProjectDto.slug) {
            const existing = await this.prisma.project.findUnique({
                where: { slug: updateProjectDto.slug },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Slug already exists');
            }
        }
        const data = { ...updateProjectDto };
        if (data.link) {
            data.demoLink = data.link;
            delete data.link;
        }
        if (data.images) {
            try {
                const parsed = JSON.parse(data.images);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    data.cover = parsed[0];
                }
            }
            catch {
            }
            delete data.images;
        }
        delete data.id;
        delete data.createdAt;
        return this.prisma.project.update({
            where: { id },
            data: data,
        });
    }
    async remove(id) {
        return this.prisma.project.delete({
            where: { id },
        });
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectService);
//# sourceMappingURL=project.service.js.map