import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
    settings: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
};

describe('SettingsService', () => {
    let service: SettingsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SettingsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<SettingsService>(SettingsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSettings', () => {
        it('should return existing settings', async () => {
            const result = { id: 1, siteTitle: 'Title' };
            jest.spyOn(prisma.settings, 'findUnique').mockResolvedValue(result as any);

            expect(await service.getSettings()).toEqual(result);
        });

        it('should create default settings if not found', async () => {
            const result = { id: 1, siteTitle: 'My Developer Portfolio' };
            jest.spyOn(prisma.settings, 'findUnique').mockResolvedValue(null);
            jest.spyOn(prisma.settings, 'create').mockResolvedValue(result as any);

            expect(await service.getSettings()).toEqual(result);
            expect(prisma.settings.create).toHaveBeenCalled();
        });
    });
});
