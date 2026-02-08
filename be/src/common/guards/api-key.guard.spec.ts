import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from './api-key.guard';
import { SettingsService } from '../../settings/settings.service';
import { UnauthorizedException } from '@nestjs/common';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  const mockSettingsService = {
    getDecryptedSetting: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (apiKey?: string): any => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: apiKey ? { 'x-api-key': apiKey } : {},
      }),
    }),
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if API key is missing', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if API key is not configured on server', async () => {
    const context = createMockContext('some-key');
    mockSettingsService.getDecryptedSetting.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('API Key not configured on server'),
    );
  });

  it('should throw UnauthorizedException if API key is invalid', async () => {
    const context = createMockContext('wrong-key');
    mockSettingsService.getDecryptedSetting.mockResolvedValue('valid-key');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid API Key'),
    );
  });

  it('should return true if API key is valid', async () => {
    const context = createMockContext('valid-key');
    mockSettingsService.getDecryptedSetting.mockResolvedValue('valid-key');

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
