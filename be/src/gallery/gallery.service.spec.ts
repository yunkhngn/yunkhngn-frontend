import { Test, TestingModule } from '@nestjs/testing';
import { GalleryService } from './gallery.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const mockPrismaService = {
  gallery: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
};

const mockCloudinaryService = {
  generateUploadSignature: jest.fn(),
};

describe('GalleryService', () => {
  let service: GalleryService;
  let cloudinary: CloudinaryService;

  beforeEach(async () => {
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

  describe('getUploadSignature', () => {
    it('should return signature', () => {
      const result = { signature: 'sig', timestamp: 123 };
      jest.spyOn(cloudinary, 'generateUploadSignature').mockReturnValue(result);

      expect(service.getUploadSignature()).toEqual(result);
    });
  });
});
