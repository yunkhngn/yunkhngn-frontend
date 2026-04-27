"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const redisStore = require("cache-manager-redis-store");
const config_1 = require("@nestjs/config");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const prisma_module_1 = require("./prisma/prisma.module");
const blog_module_1 = require("./blog/blog.module");
const project_module_1 = require("./project/project.module");
const gallery_module_1 = require("./gallery/gallery.module");
const comments_module_1 = require("./comments/comments.module");
const settings_module_1 = require("./settings/settings.module");
const user_module_1 = require("./user/user.module");
const ai_module_1 = require("./ai/ai.module");
const photo_reactions_module_1 = require("./photo-reactions/photo-reactions.module");
const contact_module_1 = require("./contact/contact.module");
const health_controller_1 = require("./health/health.controller");
const notifications_module_1 = require("./notifications/notifications.module");
const cloudflare_module_1 = require("./cloudflare/cloudflare.module");
const github_module_1 = require("./github/github.module");
const media_module_1 = require("./media/media.module");
const chat_module_1 = require("./chat/chat.module");
const system_module_1 = require("./system/system.module");
const newsletter_module_1 = require("./newsletter/newsletter.module");
const shortlink_module_1 = require("./shortlink/shortlink.module");
const album_module_1 = require("./album/album.module");
const journal_module_1 = require("./journal/journal.module");
const lastfm_module_1 = require("./lastfm/lastfm.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    store: redisStore,
                    host: configService.get('REDIS_HOST') || 'localhost',
                    port: parseInt(configService.get('REDIS_PORT') || '6379'),
                    ttl: 600,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            cloudinary_module_1.CloudinaryModule,
            prisma_module_1.PrismaModule,
            blog_module_1.BlogModule,
            project_module_1.ProjectModule,
            gallery_module_1.GalleryModule,
            comments_module_1.CommentsModule,
            settings_module_1.SettingsModule,
            user_module_1.UserModule,
            ai_module_1.AiModule,
            photo_reactions_module_1.PhotoReactionsModule,
            contact_module_1.ContactModule,
            notifications_module_1.NotificationsModule,
            cloudflare_module_1.CloudflareModule,
            github_module_1.GithubModule,
            media_module_1.MediaModule,
            chat_module_1.ChatModule,
            system_module_1.SystemModule,
            newsletter_module_1.NewsletterModule,
            shortlink_module_1.ShortlinkModule,
            album_module_1.AlbumModule,
            journal_module_1.JournalModule,
            lastfm_module_1.LastFmModule,
        ],
        controllers: [app_controller_1.AppController, health_controller_1.HealthController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map