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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const encryption_service_1 = require("../common/encryption.service");
const SYSTEM_SETTINGS = [
    'bio',
    'quote',
    'facebook',
    'github',
    'instagram',
    'linkedin',
    'tiktok',
    'email',
    'homepage_description',
    'footer_description',
    'about_content',
    'comment_forbidden_keywords',
    'education',
    'experience',
    'skills',
    'cv_url',
    'gemini_api_key',
    'ai_persona',
    'cloudinary_cloud_name',
    'cloudinary_api_key',
    'cloudinary_api_secret',
    'resend_api_key',
    'resend_domain',
    'admin_email',
    'cloudflare_zone_id',
    'cloudflare_account_id',
    'cloudflare_api_token',
    'github_api_key',
    'github_username',
    'github_repo_name',
    'chat_api_key',
    'avatar',
    'about_image_story',
    'about_image_journey',
    'about_image_skills',
    'about_image_contact',
    'lastfm_api_key',
    'lastfm_username',
];
let SettingsService = class SettingsService {
    constructor(prisma, encryptionService) {
        this.prisma = prisma;
        this.encryptionService = encryptionService;
    }
    async onModuleInit() {
        try {
            for (const title of SYSTEM_SETTINGS) {
                await this.prisma.settings.upsert({
                    where: { settingTitle: title },
                    update: { settingTitle: title },
                    create: {
                        settingTitle: title,
                        content: '',
                    },
                });
            }
        }
        catch (error) {
            console.error('Failed to initialize settings:', error);
        }
    }
    async getSettings() {
        const settings = await this.prisma.settings.findMany({
            orderBy: { id: 'asc' },
        });
        return settings.map((s) => {
            if ((s.settingTitle === 'gemini_api_key' ||
                s.settingTitle === 'cloudinary_api_secret' ||
                s.settingTitle === 'resend_api_key' ||
                s.settingTitle === 'cloudflare_api_token' ||
                s.settingTitle === 'github_api_key' ||
                s.settingTitle === 'lastfm_api_key' ||
                s.settingTitle === 'chat_api_key') &&
                s.content) {
                return { ...s, content: '********' };
            }
            return s;
        });
    }
    async findAll() {
        return this.prisma.settings.findMany();
    }
    async update(updateSettingsDto) {
        const { settingTitle } = updateSettingsDto;
        let { content } = updateSettingsDto;
        if (settingTitle === 'gemini_api_key' ||
            settingTitle === 'cloudinary_api_secret' ||
            settingTitle === 'resend_api_key' ||
            settingTitle === 'cloudflare_api_token' ||
            settingTitle === 'cloudflare_api_token' ||
            settingTitle === 'github_api_key' ||
            settingTitle === 'lastfm_api_key' ||
            settingTitle === 'chat_api_key') {
            if (content === '********') {
                return;
            }
            content = this.encryptionService.encrypt(content);
        }
        return this.prisma.settings.upsert({
            where: { settingTitle },
            update: { content },
            create: { settingTitle, content },
        });
    }
    async delete(id) {
        const setting = await this.prisma.settings.findUnique({ where: { id } });
        if (setting && SYSTEM_SETTINGS.includes(setting.settingTitle)) {
            throw new common_1.BadRequestException(`Cannot delete system setting: ${setting.settingTitle}`);
        }
        return this.prisma.settings.delete({ where: { id } });
    }
    async getDecryptedSetting(title) {
        try {
            const setting = await this.prisma.settings.findUnique({
                where: { settingTitle: title },
            });
            if (!setting || !setting.content)
                return null;
            if (title === 'gemini_api_key' ||
                title === 'cloudinary_api_secret' ||
                title === 'resend_api_key' ||
                title === 'cloudflare_api_token' ||
                title === 'github_api_key' ||
                title === 'lastfm_api_key' ||
                title === 'chat_api_key') {
                return this.encryptionService.decrypt(setting.content);
            }
            return setting.content;
        }
        catch (error) {
            console.warn('Failed to fetch setting:', title, error.message);
            return null;
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map