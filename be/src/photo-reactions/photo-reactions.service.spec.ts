import { Test, TestingModule } from '@nestjs/testing';
import { PhotoReactionsService } from './photo-reactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const mockPrismaService = {
  photoReaction: {
    upsert: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
};

const mockNotificationsService = {
  create: jest.fn().mockResolvedValue({}),
};

describe('PhotoReactionsService', () => {
  let service: PhotoReactionsService;
  let prisma: PrismaService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotoReactionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<PhotoReactionsService>(PhotoReactionsService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOrUpdateReaction', () => {
    it('should upsert reaction and trigger notification', async () => {
      const photoId = 'photo1';
      const uid = 'user1';
      const reactionType = 'LOVE';
      const result = { id: '1', photoId, uid, reactionType };

      mockPrismaService.photoReaction.upsert.mockResolvedValue(result);

      await service.addOrUpdateReaction(photoId, uid, reactionType);

      expect(prisma.photoReaction.upsert).toHaveBeenCalledWith({
        where: { photoId_uid: { photoId, uid } },
        update: { reactionType },
        create: { photoId, uid, reactionType },
      });
      expect(notificationsService.create).toHaveBeenCalledWith(
        'LIKE',
        expect.stringContaining(reactionType),
        `/photo#photo-${photoId}`,
      );
    });
  });

  describe('removeReaction', () => {
    it('should delete reaction', async () => {
      const photoId = 'photo1';
      const uid = 'user1';

      mockPrismaService.photoReaction.delete.mockResolvedValue({ id: '1' });

      await service.removeReaction(photoId, uid);

      expect(prisma.photoReaction.delete).toHaveBeenCalledWith({
        where: { photoId_uid: { photoId, uid } },
      });
    });
  });

  describe('getPhotoReactions', () => {
    it('should return reactions for a photo', async () => {
      const photoId = 'photo1';
      const reactions = [{ id: '1', reactionType: 'like' }];

      mockPrismaService.photoReaction.findMany.mockResolvedValue(reactions);

      const result = await service.getPhotoReactions(photoId);

      expect(result).toEqual({
        counts: {
          like: 1,
          heart: 0,
          cat: 0,
          fire: 0,
          laugh: 0,
        },
        total: 1,
      });
      expect(prisma.photoReaction.findMany).toHaveBeenCalledWith({
        where: { photoId },
      });
    });
  });
});
