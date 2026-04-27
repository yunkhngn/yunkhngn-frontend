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
exports.PhotoReactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let PhotoReactionsService = class PhotoReactionsService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async addOrUpdateReaction(photoId, uid, reactionType) {
        const result = await this.prisma.photoReaction.upsert({
            where: {
                photoId_uid: { photoId, uid },
            },
            update: {
                reactionType,
            },
            create: {
                photoId,
                uid,
                reactionType,
            },
        });
        this.notificationsService
            .create('LIKE', `New ${reactionType} reaction on photo`, `/photo#photo-${photoId}`)
            .catch((err) => console.error('Failed to send real-time notification:', err));
        return result;
    }
    async removeReaction(photoId, uid) {
        try {
            return await this.prisma.photoReaction.delete({
                where: {
                    photoId_uid: { photoId, uid },
                },
            });
        }
        catch {
            return null;
        }
    }
    async getPhotoReactions(photoId) {
        const reactions = await this.prisma.photoReaction.findMany({
            where: { photoId },
        });
        const counts = {
            like: 0,
            heart: 0,
            cat: 0,
            fire: 0,
            laugh: 0,
        };
        reactions.forEach((reaction) => {
            if (counts[reaction.reactionType] !== undefined) {
                counts[reaction.reactionType]++;
            }
        });
        return {
            counts,
            total: reactions.length,
        };
    }
    async getUserReaction(photoId, uid) {
        return this.prisma.photoReaction.findUnique({
            where: {
                photoId_uid: { photoId, uid },
            },
        });
    }
};
exports.PhotoReactionsService = PhotoReactionsService;
exports.PhotoReactionsService = PhotoReactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], PhotoReactionsService);
//# sourceMappingURL=photo-reactions.service.js.map