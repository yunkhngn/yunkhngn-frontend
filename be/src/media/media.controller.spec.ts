import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { HttpException } from '@nestjs/common';

const mockCloudinaryService = {
  getImages: jest.fn(),
  deleteImage: jest.fn(),
  generateUploadSignature: jest.fn(),
};

describe('MediaController', () => {
  let controller: MediaController;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getImages', () => {
    it('should call cloudinaryService.getImages', async () => {
      const mockResult = { resources: [], next_cursor: 'abc' };
      mockCloudinaryService.getImages.mockResolvedValue(mockResult);

      const result = await controller.getImages('cursor123');

      expect(cloudinaryService.getImages).toHaveBeenCalledWith('cursor123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteImage', () => {
    it('should call cloudinaryService.deleteImage', async () => {
      const publicId = 'test/image';
      mockCloudinaryService.deleteImage.mockResolvedValue({ result: 'ok' });

      const result = await controller.deleteImage(publicId);

      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(publicId);
      expect(result).toEqual({ result: 'ok' });
    });

    it('should throw error if publicId is missing', async () => {
      await expect(controller.deleteImage('')).rejects.toThrow(HttpException);
    });
  });

  describe('getSignature', () => {
    it('should call cloudinaryService.generateUploadSignature', () => {
      const mockSig = { signature: 'sig', timestamp: 123 };
      mockCloudinaryService.generateUploadSignature.mockReturnValue(mockSig);

      const result = controller.getSignature('folder/test');

      expect(cloudinaryService.generateUploadSignature).toHaveBeenCalledWith({
        folder: 'folder/test',
      });
      expect(result).toEqual(mockSig);
    });
  });
});
