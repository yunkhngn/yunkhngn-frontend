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
exports.ShortlinkController = void 0;
const common_1 = require("@nestjs/common");
const shortlink_service_1 = require("./shortlink.service");
const create_shortlink_dto_1 = require("./dto/create-shortlink.dto");
const update_shortlink_dto_1 = require("./dto/update-shortlink.dto");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let ShortlinkController = class ShortlinkController {
    constructor(shortlinkService) {
        this.shortlinkService = shortlinkService;
    }
    create(dto) {
        return this.shortlinkService.create(dto);
    }
    findAll() {
        return this.shortlinkService.findAll();
    }
    resolve(code) {
        return this.shortlinkService.resolve(code);
    }
    update(id, dto) {
        return this.shortlinkService.update(id, dto);
    }
    remove(id) {
        return this.shortlinkService.remove(id);
    }
    bulkDelete(body) {
        return this.shortlinkService.bulkDelete(body.ids);
    }
    bulkUpdateStatus(body) {
        return this.shortlinkService.bulkUpdateStatus(body.ids, body.isActive);
    }
};
exports.ShortlinkController = ShortlinkController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shortlink_dto_1.CreateShortlinkDto]),
    __metadata("design:returntype", void 0)
], ShortlinkController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShortlinkController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('resolve/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShortlinkController.prototype, "resolve", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shortlink_dto_1.UpdateShortlinkDto]),
    __metadata("design:returntype", void 0)
], ShortlinkController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShortlinkController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('bulk/delete'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShortlinkController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Post)('bulk/status'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShortlinkController.prototype, "bulkUpdateStatus", null);
exports.ShortlinkController = ShortlinkController = __decorate([
    (0, common_1.Controller)('shortlinks'),
    __metadata("design:paramtypes", [shortlink_service_1.ShortlinkService])
], ShortlinkController);
//# sourceMappingURL=shortlink.controller.js.map