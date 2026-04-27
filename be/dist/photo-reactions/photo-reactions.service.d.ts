import { PrismaService } from '../prisma/prisma.service';
import { PhotoReaction } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PhotoReactionsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    addOrUpdateReaction(photoId: string, uid: string, reactionType: string): Promise<PhotoReaction>;
    removeReaction(photoId: string, uid: string): Promise<PhotoReaction | null>;
    getPhotoReactions(photoId: string): Promise<{
        counts: Record<string, number>;
        total: number;
    }>;
    getUserReaction(photoId: string, uid: string): Promise<PhotoReaction | null>;
}
