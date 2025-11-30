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
            const dto = { title: 'Test', description: 'Desc' };
            const result = { id: '1', ...dto, createdAt: new Date(), techStack: null, images: null, tags: null };

            jest.spyOn(prisma.project, 'create').mockResolvedValue(result);

            expect(await service.create(dto)).toEqual(result);
        });
    });
});
