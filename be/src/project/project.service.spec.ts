import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const dto = { title: 'Test', description: 'Desc', slug: 'test-project' };
      const result = {
        id: '1',
        ...dto,
        createdAt: new Date(),
        techStack: null,
        tags: null,
        cover: null,
        repoLink: null,
        demoLink: null,
        contentJSON: null,
      };

      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.project, 'create').mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { slug: dto.slug },
      });
      expect(prisma.project.create).toHaveBeenCalledWith({ data: dto });
    });
  });
});
