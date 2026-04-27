"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoReactionsModule = void 0;
const common_1 = require("@nestjs/common");
const photo_reactions_service_1 = require("./photo-reactions.service");
const photo_reactions_controller_1 = require("./photo-reactions.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_module_1 = require("../notifications/notifications.module");
let PhotoReactionsModule = class PhotoReactionsModule {
};
exports.PhotoReactionsModule = PhotoReactionsModule;
exports.PhotoReactionsModule = PhotoReactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule],
        controllers: [photo_reactions_controller_1.PhotoReactionsController],
        providers: [photo_reactions_service_1.PhotoReactionsService, prisma_service_1.PrismaService],
    })
], PhotoReactionsModule);
//# sourceMappingURL=photo-reactions.module.js.map