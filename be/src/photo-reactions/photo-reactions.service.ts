import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PhotoReaction } from '@prisma/client';

@Injectable()
export class PhotoReactionsService {
  constructor(private prisma: PrismaService) {}

  async addOrUpdateReaction(
    photoId: string,
    uid: string,
    reactionType: string,
  ): Promise<PhotoReaction> {
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

  async removeReaction(
    photoId: string,
    uid: string,
  ): Promise<PhotoReaction | null> {
    try {
      return await this.prisma.photoReaction.delete({
        where: {
          photoId_uid: { photoId, uid },
        },
      });
    } catch {
      // Reaction doesn't exist, that's fine
      return null;
    }
  }

  async getPhotoReactions(photoId: string) {
    const reactions = await this.prisma.photoReaction.findMany({
      where: { photoId },
    });

    // Count reactions by type
    const counts: Record<string, number> = {
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

  async getUserReaction(
    photoId: string,
    uid: string,
  ): Promise<PhotoReaction | null> {
    return this.prisma.photoReaction.findUnique({
      where: {
        photoId_uid: { photoId, uid },
      },
    });
  }
}
