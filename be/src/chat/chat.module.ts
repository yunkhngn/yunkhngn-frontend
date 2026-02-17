import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SettingsModule } from '../settings/settings.module';
import { ProjectModule } from '../project/project.module';
import { BlogModule } from '../blog/blog.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [SettingsModule, ProjectModule, BlogModule, CloudinaryModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule { }
