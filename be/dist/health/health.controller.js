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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("../settings/settings.service");
let HealthController = class HealthController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async check() {
        const cloudName = (await this.settingsService.getDecryptedSetting('cloudinary_cloud_name')) || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = (await this.settingsService.getDecryptedSetting('cloudinary_api_key')) ||
            process.env.CLOUDINARY_API_KEY;
        const resendKey = (await this.settingsService.getDecryptedSetting('resend_api_key')) ||
            process.env.RESEND_API_KEY;
        const cfZone = (await this.settingsService.getDecryptedSetting('cloudflare_zone_id')) ||
            process.env.CLOUDFLARE_ZONE_ID;
        const cfToken = (await this.settingsService.getDecryptedSetting('cloudflare_api_token')) || process.env.CLOUDFLARE_API_TOKEN;
        const ghKey = (await this.settingsService.getDecryptedSetting('github_api_key')) ||
            process.env.GITHUB_API_KEY;
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                gemini: !!process.env.GEMINI_API_KEY,
                resend: !!resendKey,
                cloudflare: !!(cfZone && cfToken),
                cloudinary: !!(cloudName && apiKey),
                github: !!ghKey,
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], HealthController);
//# sourceMappingURL=health.controller.js.map