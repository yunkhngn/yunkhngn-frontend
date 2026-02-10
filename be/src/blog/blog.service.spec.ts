import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  blog: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('BlogService', () => {
  let service: BlogService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog', async () => {
      const dto = { title: 'Test', slug: 'test', contentJSON: '{}' };
      const result = {
        id: '1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'DRAFT',
        thumbnail: null,
        tags: null,
        seoTitle: null,
        seoDescription: null,
        seoImage: null,
        views: 0,
      };

      jest.spyOn(prisma.blog, 'create').mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(prisma.blog.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return an array of blogs', async () => {
      const result = [
        {
          id: '1',
          title: 'Test',
          slug: 'test',
          contentJSON: '{}',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'DRAFT',
          thumbnail: null,
          tags: null,
          seoTitle: null,
          seoDescription: null,
          seoImage: null,
          views: 0,
        },
      ];
      jest.spyOn(prisma.blog, 'findMany').mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single blog', async () => {
      const result = {
        id: '1',
        title: 'Test',
        slug: 'test',
        contentJSON: '{}',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'DRAFT',
        thumbnail: null,
        tags: null,
        seoTitle: null,
        seoDescription: null,
        seoImage: null,
        views: 0,
      };
      jest.spyOn(prisma.blog, 'findFirst').mockResolvedValue(result);
      jest.spyOn(prisma.blog, 'findMany').mockResolvedValue([]); // Mock related posts

      expect(await service.findOne('test')).toEqual({ ...result, relatedPosts: [] });
    });
  });
});
