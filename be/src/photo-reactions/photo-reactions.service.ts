import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotoReactionsService {
    constructor(private prisma: PrismaService) { }

    async addOrUpdateReaction(photoId: string, uid: string, reactionType: string) {
        return this.prisma.photoReaction.upsert({
            where: {
                photoId_uid: { photoId, uid },
            },
            update: {
                reactionType,
            },
            create: {
                photoId,
                uid,
                reactionType,
            },
        });
    }

    async removeReaction(photoId: string, uid: string) {
        try {
            return await this.prisma.photoReaction.delete({
                where: {
                    photoId_uid: { photoId, uid },
                },
            });
        } catch (error) {
            // Reaction doesn't exist, that's fine
            return null;
        }
    }

    async getPhotoReactions(photoId: string) {
        const reactions = await this.prisma.photoReaction.findMany({
            where: { photoId },
        });

        // Count reactions by type
        const counts = {
            like: 0,
            heart: 0,
            cat: 0,
            fire: 0,
            laugh: 0,
        };

        reactions.forEach((reaction) => {
            if (counts[reaction.reactionType] !== undefined) {
                counts[reaction.reactionType]++;
            }
        });

        return {
            counts,
            total: reactions.length,
        };
    }

    async getUserReaction(photoId: string, uid: string) {
        return this.prisma.photoReaction.findUnique({
            where: {
                photoId_uid: { photoId, uid },
            },
        });
    }
}
