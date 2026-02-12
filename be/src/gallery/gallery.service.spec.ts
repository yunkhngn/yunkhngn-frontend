import { Test, TestingModule } from '@nestjs/testing';
import { GalleryService } from './gallery.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const mockPrismaService = {
  gallery: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn((ops) => Promise.all(ops)),
};

const mockCloudinaryService = {
  generateUploadSignature: jest.fn(),
};

describe('GalleryService', () => {
  let service: GalleryService;
  let cloudinary: CloudinaryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<GalleryService>(GalleryService);
    cloudinary = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated photos with default params', async () => {
      mockPrismaService.gallery.findMany.mockResolvedValue([{ id: '1' }]);
      mockPrismaService.gallery.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual({
        data: [{ id: '1' }],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it('should filter by albumId and tag', async () => {
      mockPrismaService.gallery.findMany.mockResolvedValue([]);
      mockPrismaService.gallery.count.mockResolvedValue(0);

      await service.findAll({
        albumId: 'album-1',
        tag: 'travel',
        page: 1,
        limit: 10,
      });

      expect(mockPrismaService.gallery.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { albumId: 'album-1', tags: { contains: 'travel' } },
        }),
      );
    });
  });

  describe('incrementViews', () => {
    it('should fire and forget', () => {
      mockPrismaService.gallery.update.mockResolvedValue({});
      const result = service.incrementViews('photo-1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('reorder', () => {
    it('should update sort orders in transaction', async () => {
      mockPrismaService.gallery.update.mockResolvedValue({});
      const items = [
        { id: '1', sortOrder: 0 },
        { id: '2', sortOrder: 1 },
      ];
      const result = await service.reorder(items);
      expect(result).toEqual({ updated: 2 });
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple photos', async () => {
      mockPrismaService.gallery.updateMany.mockResolvedValue({ count: 3 });
      const result = await service.bulkUpdate(['1', '2', '3'], {
        tags: 'food',
      });
      expect(result).toEqual({ updated: 3 });
    });
  });

  describe('getAllTags', () => {
    it('should extract and deduplicate tags', async () => {
      mockPrismaService.gallery.findMany.mockResolvedValue([
        { tags: 'travel, food' },
        { tags: 'food, daily' },
      ]);
      const result = await service.getAllTags();
      expect(result).toEqual(['daily', 'food', 'travel']);
    });
  });

  describe('getUploadSignature', () => {
    it('should return signature', () => {
      const result = {
        signature: 'sig',
        timestamp: 123,
        cloudName: 'test-cloud',
        apiKey: 'test-key',
      };
      jest.spyOn(cloudinary, 'generateUploadSignature').mockReturnValue(result);

      expect(service.getUploadSignature()).toEqual(result);
    });
  });
});
