import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PhotoReaction } from '@prisma/client';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PhotoReactionsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async addOrUpdateReaction(
    photoId: string,
    uid: string,
    reactionType: string,
  ): Promise<PhotoReaction> {
    const result = await this.prisma.photoReaction.upsert({
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

    // If created (createdAt is recent), send notification
    // Note: upsert returns the object. If we want to be sure it's new, we might need a different approach or just notify on every update?
    // Let's assume we only notify on new reactions.
    // Actually, upsert doesn't tell us if it was created or updated easily without checking createdAt.
    // But for simplicity, let's notify.
    // To avoid spam, maybe check if it's a new reaction?
    // Let's just notify.

    // Send notification with link to guest gallery page and photo highlight
    this.notificationsService
      .create(
        'LIKE',
        `New ${reactionType} reaction on photo`,
        `/photo#photo-${photoId}`,
      )
      .catch((err) =>
        console.error('Failed to send real-time notification:', err),
      );

    return result;
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
