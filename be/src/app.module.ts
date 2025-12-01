import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaModule } from './prisma/prisma.module';
import { BlogModule } from './blog/blog.module';
import { ProjectModule } from './project/project.module';
import { GalleryModule } from './gallery/gallery.module';
import { CommentModule } from './comment/comment.module';
import { CommentsModule } from './comments/comments.module';
import { SettingsModule } from './settings/settings.module';
import { UserModule } from './user/user.module';
import { Comment } from './comments/entities/comment.entity';
import { CommentVote } from './comments/entities/comment-vote.entity';
import { CommentReport } from './comments/entities/comment-report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1434,
      username: 'sa',
      password: 'YourStrong@Passw0rd',
      database: 'blogdb',
      entities: [Comment, CommentVote, CommentReport],
      synchronize: true, // Set to false in production
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    CloudinaryModule,
    PrismaModule,
    BlogModule,
    ProjectModule,
    GalleryModule,
    CommentModule,
    CommentsModule,
    SettingsModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
