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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoReactionsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const photo_reactions_service_1 = require("./photo-reactions.service");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const create_reaction_dto_1 = require("./dto/create-reaction.dto");
let PhotoReactionsController = class PhotoReactionsController {
    constructor(photoReactionsService) {
        this.photoReactionsService = photoReactionsService;
    }
    async addReaction(photoId, data, req) {
        const reactionType = data.reactionType;
        const uid = req.user?.uid;
        if (!uid)
            throw new Error('User not authenticated');
        const validTypes = ['like', 'heart', 'cat', 'fire', 'laugh'];
        if (!validTypes.includes(reactionType)) {
            throw new Error('Invalid reaction type');
        }
        const reaction = await this.photoReactionsService.addOrUpdateReaction(photoId, uid, reactionType);
        const stats = await this.photoReactionsService.getPhotoReactions(photoId);
        return {
            reaction,
            stats,
        };
    }
    async removeReaction(photoId, req) {
        const uid = req.user?.uid;
        if (!uid)
            throw new Error('User not authenticated');
        await this.photoReactionsService.removeReaction(photoId, uid);
        const stats = await this.photoReactionsService.getPhotoReactions(photoId);
        return { stats };
    }
    async getReactions(photoId, req) {
        const stats = await this.photoReactionsService.getPhotoReactions(photoId);
        let userReaction = null;
        if (req.user?.uid) {
            userReaction = await this.photoReactionsService.getUserReaction(photoId, req.user.uid);
        }
        return {
            stats,
            userReaction: userReaction?.reactionType || null,
        };
    }
};
exports.PhotoReactionsController = PhotoReactionsController;
__decorate([
    (0, common_1.Post)(':photoId'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('photoId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_reaction_dto_1.CreateReactionDto, Object]),
    __metadata("design:returntype", Promise)
], PhotoReactionsController.prototype, "addReaction", null);
__decorate([
    (0, common_1.Delete)(':photoId'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('photoId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhotoReactionsController.prototype, "removeReaction", null);
__decorate([
    (0, common_1.Get)(':photoId'),
    __param(0, (0, common_1.Param)('photoId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhotoReactionsController.prototype, "getReactions", null);
exports.PhotoReactionsController = PhotoReactionsController = __decorate([
    (0, common_1.Controller)('photo-reactions'),
    __metadata("design:paramtypes", [photo_reactions_service_1.PhotoReactionsService])
], PhotoReactionsController);
//# sourceMappingURL=photo-reactions.controller.js.map