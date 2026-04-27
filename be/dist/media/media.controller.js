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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let MediaController = class MediaController {
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    getSignature(folder, format, publicId) {
        const params = {
            folder: folder || 'blog-portfolio',
        };
        if (format) {
            params.format = format;
        }
        if (publicId) {
            params.public_id = publicId;
        }
        return this.cloudinaryService.generateUploadSignature(params);
    }
    async getImages(cursor) {
        return this.cloudinaryService.getImages(cursor);
    }
    async deleteImage(publicId) {
        if (!publicId) {
            throw new common_1.HttpException('publicId is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.cloudinaryService.deleteImage(publicId);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Get)('signature'),
    __param(0, (0, common_1.Query)('folder')),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('public_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getSignature", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getImages", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteImage", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], MediaController);
//# sourceMappingURL=media.controller.js.map