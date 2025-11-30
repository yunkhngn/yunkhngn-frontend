import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
    comment: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        update: jest.fn(),
    },
};

describe('CommentService', () => {
    let service: CommentService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<CommentService>(CommentService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('remove', () => {
        it('should delete by id if admin', async () => {
            jest.spyOn(prisma.comment, 'delete').mockResolvedValue({} as any);
            await service.remove('1', 'uid', true);
            expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: '1' } });
        });

        it('should delete by id and uid if not admin', async () => {
            jest.spyOn(prisma.comment, 'deleteMany').mockResolvedValue({ count: 1 });
            await service.remove('1', 'uid', false);
            expect(prisma.comment.deleteMany).toHaveBeenCalledWith({ where: { id: '1', uid: 'uid' } });
        });
    });
});
