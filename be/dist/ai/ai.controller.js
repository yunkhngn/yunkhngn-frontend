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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async generate(prompt) {
        if (!prompt) {
            throw new Error('Prompt is required');
        }
        const text = await this.aiService.generateText(prompt);
        return { text };
    }
    async generateProjectInfo(repoUrl, language) {
        if (!repoUrl) {
            throw new Error('Repo URL is required');
        }
        return this.aiService.generateProjectInfo(repoUrl, language);
    }
    async generateBlogContent(prompt, currentContent, language) {
        if (!prompt) {
            throw new Error('Prompt is required');
        }
        const content = await this.aiService.generateBlogContent(prompt, currentContent, language);
        return { content };
    }
    async generateDashboardSummary(stats, recentActivities, language) {
        const summary = await this.aiService.generateDashboardSummary(stats, recentActivities || [], language);
        return { summary };
    }
    async chatWithSystem(data) {
        return this.aiService.chatWithSystem(data.message, data.history || [], data.language);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Body)('prompt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('project-info'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Body)('repoUrl')),
    __param(1, (0, common_1.Body)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateProjectInfo", null);
__decorate([
    (0, common_1.Post)('blog-content'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Body)('prompt')),
    __param(1, (0, common_1.Body)('currentContent')),
    __param(2, (0, common_1.Body)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateBlogContent", null);
__decorate([
    (0, common_1.Post)('dashboard-summary'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Body)('stats')),
    __param(1, (0, common_1.Body)('recentActivities')),
    __param(2, (0, common_1.Body)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateDashboardSummary", null);
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chatWithSystem", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map