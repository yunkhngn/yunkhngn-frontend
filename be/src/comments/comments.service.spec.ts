import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

const mockSettingsService = {
  getSettings: jest.fn(),
};

const mockNotificationsService = {
  create: jest.fn().mockResolvedValue({}),
};

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const uid = 'user1';
    const dto = {
      content: 'Hello world',
      blogId: 'blog1',
      displayName: 'User',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockSettingsService.getSettings.mockResolvedValue([]);
    });

    it('should create a comment', async () => {
      mockPrismaService.comment.create.mockResolvedValue({
        id: '1',
        ...dto,
        uid,
      });
      const result = await service.create(dto, uid);
      expect(result).toBeDefined();
    });

    it('should sanitize XSS', async () => {
      const xssDto = { ...dto, content: '<script>alert(1)</script>Hello' };
      mockPrismaService.comment.create.mockResolvedValue({
        id: '1',
        ...dto,
        content: 'Hello',
        uid,
      });

      await service.create(xssDto, uid);

      expect(mockPrismaService.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ content: 'Hello' }),
        }),
      );
    });

    it('should reject empty content after sanitization', async () => {
      const xssDto = { ...dto, content: '<script>alert(1)</script>' };
      await expect(service.create(xssDto, uid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject repeated punctuation', async () => {
      const badDto = { ...dto, content: 'Hello????' }; // 4 ?
      await expect(service.create(badDto, uid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept allowed repeated punctuation', async () => {
      const goodDto = { ...dto, content: 'Hello???' }; // 3 ?
      mockPrismaService.comment.create.mockResolvedValue({
        id: '1',
        ...goodDto,
        uid,
      });
      await expect(service.create(goodDto, uid)).resolves.toBeDefined();
    });

    it('should reject excessive repeated characters', async () => {
      const badDto = { ...dto, content: 'Heeeeeeeeeeello' }; // 11 e
      await expect(service.create(badDto, uid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject forbidden keywords', async () => {
      mockSettingsService.getSettings.mockResolvedValue([
        { settingTitle: 'comment_forbidden_keywords', content: 'bad,evil' },
      ]);
      const badDto = { ...dto, content: 'This is bad content' };
      await expect(service.create(badDto, uid)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
