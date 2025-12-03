import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';
import { AiModule } from '../ai/ai.module';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EmailModule, AiModule, NotificationsModule],
  controllers: [ContactController],
  providers: [ContactService, PrismaService],
})
export class ContactModule { }
