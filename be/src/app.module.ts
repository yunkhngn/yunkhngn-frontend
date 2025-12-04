import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
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
export class AppModule { }
