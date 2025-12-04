import { Module } from '@nestjs/common';
import { PhotoReactionsService } from './photo-reactions.service';
import { PhotoReactionsController } from './photo-reactions.controller';
import { PrismaService } from '../prisma/prisma.service';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PhotoReactionsController],
  providers: [PhotoReactionsService, PrismaService],
})
export class PhotoReactionsModule {}
