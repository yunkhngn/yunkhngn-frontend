import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';

const mockPrismaService = {
  settings: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const mockEncryptionService = {
  encrypt: jest.fn((val) => val),
  decrypt: jest.fn((val) => val),
};

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EncryptionService, useValue: mockEncryptionService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should return all settings', async () => {
      const result = [{ id: 1, settingTitle: 'bio', content: 'test' }];
      jest.spyOn(prisma.settings, 'findMany').mockResolvedValue(result);

      expect(await service.getSettings()).toEqual(result);
      expect(prisma.settings.findMany).toHaveBeenCalled();
    });
  });

  describe('onModuleInit', () => {
    it('should initialize default settings', async () => {
      await service.onModuleInit();
      expect(prisma.settings.upsert).toHaveBeenCalled();
    });
  });
});
