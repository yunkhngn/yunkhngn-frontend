import { Module } from '@nestjs/common';
import { PhotoReactionsService } from './photo-reactions.service';
import { PhotoReactionsController } from './photo-reactions.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [PhotoReactionsController],
    providers: [PhotoReactionsService, PrismaService],
})
export class PhotoReactionsModule { }
