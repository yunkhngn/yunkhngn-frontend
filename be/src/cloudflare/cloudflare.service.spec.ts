import { Test, TestingModule } from '@nestjs/testing';
import { CloudflareService } from './cloudflare.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('CloudflareService', () => {
  let service: CloudflareService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'CLOUDFLARE_ZONE_ID':
          return 'mock-zone-id';
        case 'CLOUDFLARE_ACCOUNT_ID':
          return 'mock-account-id';
        case 'CLOUDFLARE_API_TOKEN':
          return 'mock-api-token';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudflareService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CloudflareService>(CloudflareService);

    // Mock global fetch
    global.fetch = jest.fn();

    // Mock Logger to prevent console noise
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnalytics', () => {
    it('should return analytics data when API call is successful', async () => {
      const mockResponse = {
        data: {
          viewer: {
            zones: [
              {
                httpRequests1hGroups: [
                  {
                    dimensions: { datetime: '2023-01-01T00:00:00Z' },
                    sum: {
                      requests: 100,
                      bytes: 1024,
                      pageViews: 50,
                      threats: 0,
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.getAnalytics('24h');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-api-token',
          }),
        }),
      );

      expect(result).toEqual({
        chartData: [
          {
            time: '2023-01-01T00:00:00Z',
            requests: 100,
            bytes: 1024,
            pageViews: 50,
            threats: 0,
          },
        ],
        totals: {
          requests: 100,
          bytes: 1024,
          pageViews: 50,
          threats: 0,
        },
      });
    });

    it('should throw error when API call fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(service.getAnalytics('24h')).rejects.toThrow(
        'Cloudflare API error: Unauthorized',
      );
    });

    it('should throw error when GraphQL returns errors', async () => {
      const mockResponse = {
        errors: [{ message: 'GraphQLError' }],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await expect(service.getAnalytics('24h')).rejects.toThrow(
        'Failed to fetch Cloudflare analytics',
      );
    });

    it('should return null if credentials are missing', async () => {
      mockConfigService.get.mockReturnValue(null);
      // Re-instantiate service to pick up new config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CloudflareService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithoutCreds =
        module.get<CloudflareService>(CloudflareService);

      const result = await serviceWithoutCreds.getAnalytics('24h');
      expect(result).toBeNull();
    });
  });
});
