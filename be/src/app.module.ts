import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaModule } from './prisma/prisma.module';
import { BlogModule } from './blog/blog.module';
import { ProjectModule } from './project/project.module';
import { GalleryModule } from './gallery/gallery.module';
import { CommentsModule } from './comments/comments.module';
import { SettingsModule } from './settings/settings.module';
import { UserModule } from './user/user.module';
import { AiModule } from './ai/ai.module';
import { PhotoReactionsModule } from './photo-reactions/photo-reactions.module';
import { ContactModule } from './contact/contact.module';

import { HealthController } from './health/health.controller';

import { NotificationsModule } from './notifications/notifications.module';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { GithubModule } from './github/github.module';
import { MediaModule } from './media/media.module';
import { ChatModule } from './chat/chat.module';
import { SystemModule } from './system/system.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ShortlinkModule } from './shortlink/shortlink.module';
import { AlbumModule } from './album/album.module';
import { JournalModule } from './journal/journal.module';
import { LastFmModule } from './lastfm/lastfm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: parseInt(configService.get<string>('REDIS_PORT') || '6379'),
        ttl: 600, // 10 minutes default
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CloudinaryModule,
    PrismaModule,
    BlogModule,
    ProjectModule,
    GalleryModule,
    CommentsModule,
    SettingsModule,
    UserModule,
    AiModule,
    PhotoReactionsModule,
    ContactModule,
    NotificationsModule,
    CloudflareModule,
    GithubModule,
    MediaModule,
    ChatModule,
    SystemModule,
    NewsletterModule,
    ShortlinkModule,
    AlbumModule,
    JournalModule,
    LastFmModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
