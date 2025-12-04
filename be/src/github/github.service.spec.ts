import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('GithubService', () => {
  let service: GithubService;

  let mockOctokit: any;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'GITHUB_API_KEY':
          return 'mock-api-key';
        case 'GITHUB_USERNAME':
          return 'mock-username';
        case 'GITHUB_REPO_NAME':
          return 'mock-repo-name';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);

    // Mock Logger to prevent console noise
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    // Mock Octokit instance
    mockOctokit = {
      request: jest.fn(),
    };
    // Manually inject mock Octokit
    (service as any).octokit = mockOctokit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPublicRepos', () => {
    it('should return repositories on success', async () => {
      const mockRepos = [
        { id: 1, name: 'repo1' },
        { id: 2, name: 'repo2' },
      ];
      mockOctokit.request.mockResolvedValue({ data: mockRepos });

      const result = await service.getPublicRepos();

      expect(result).toEqual(mockRepos);
      expect(mockOctokit.request).toHaveBeenCalledWith(
        'GET /users/{username}/repos',
        {
          username: 'mock-username',
          sort: 'updated',
          per_page: 10,
          type: 'public',
        },
      );
    });

    it('should return empty array if octokit is not initialized', async () => {
      (service as any).octokit = undefined;
      const result = await service.getPublicRepos();
      expect(result).toEqual([]);
    });

    it('should return empty array and log error on failure', async () => {
      const error = new Error('API Error');
      mockOctokit.request.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      const result = await service.getPublicRepos();

      expect(result).toEqual([]);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to fetch public repos',
        error,
      );
    });
  });

  describe('getWorkflowRuns', () => {
    it('should return mapped workflow runs on success', async () => {
      const mockRuns = {
        workflow_runs: [
          {
            id: 1,
            name: 'Deploy',
            status: 'completed',
            conclusion: 'success',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:01:00Z',
            html_url: 'http://github.com/run/1',
            run_number: 1,
            display_title: 'Deploy #1',
            actor: { login: 'user', avatar_url: 'url' },
          },
        ],
      };
      mockOctokit.request.mockResolvedValue({ data: mockRuns });

      const result = await service.getWorkflowRuns();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].duration).toBe(60000); // 1 minute
      expect(mockOctokit.request).toHaveBeenCalledWith(
        'GET /repos/{owner}/{repo}/actions/runs',
        {
          owner: 'mock-username',
          repo: 'mock-repo-name',
          per_page: 5,
        },
      );
    });

    it('should return empty array if octokit is not initialized', async () => {
      (service as any).octokit = undefined;
      const result = await service.getWorkflowRuns();
      expect(result).toEqual([]);
    });

    it('should return empty array and log warning on 404', async () => {
      const error: any = new Error('Not Found');
      error.status = 404;
      mockOctokit.request.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      const result = await service.getWorkflowRuns();

      expect(result).toEqual([]);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('not found or token lacks permissions'),
      );
    });

    it('should return empty array and log error on other errors', async () => {
      const error = new Error('API Error');
      mockOctokit.request.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      const result = await service.getWorkflowRuns();

      expect(result).toEqual([]);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to fetch workflow runs',
        error,
      );
    });
  });
});
