import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

describe('AiService.generateProjectInfo', () => {
  let service: AiService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'fake-api-key';
      return null;
    }),
  };

  const mockPrismaService = {};

  const mockSettingsService = {
    getDecryptedSetting: jest.fn().mockResolvedValue(null),
  };

  const mockModel = {
    generateContent: jest.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            title: 'Generated title',
            description: 'Generated description',
            content: '<p>Generated content</p>',
            techStack: ['Next.js'],
            tags: ['Web'],
            demoLink: '',
          }),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    jest.spyOn(service as any, 'getModel').mockResolvedValue(mockModel);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => '# README',
    } as unknown as Response);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses normalized repo name for .git clone URL', async () => {
    await service.generateProjectInfo('https://github.com/vercel/next.js.git');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/vercel/next.js/readme',
      expect.objectContaining({
        headers: { Accept: 'application/vnd.github.raw' },
      }),
    );
  });

  it('ignores query string in GitHub repo URL', async () => {
    await service.generateProjectInfo(
      'https://github.com/vercel/next.js?tab=readme-ov-file',
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/vercel/next.js/readme',
      expect.objectContaining({
        headers: { Accept: 'application/vnd.github.raw' },
      }),
    );
  });
});
