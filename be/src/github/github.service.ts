import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class GithubService implements OnModuleInit {
  private octokit: any;
  private readonly logger = new Logger(GithubService.name);

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) { }

  async onModuleInit() {
    const token =
      (await this.settingsService.getDecryptedSetting('github_api_key')) ||
      this.configService.get<string>('GITHUB_API_KEY');
    const username = await this.getUsername();
    const repoName = await this.getRepoName();

    if (!username) {
      this.logger.error('GitHub Username is not defined in settings or .env');
    }
    if (!repoName) {
      this.logger.error('GitHub Repo Name is not defined in settings or .env');
    }

    if (token) {
      try {
        // Bypass TypeScript transpilation of dynamic import
        const { Octokit } = await eval('import("octokit")');
        this.octokit = new Octokit({ auth: token });
      } catch (error) {
        this.logger.error('Failed to load Octokit', error);
      }
    } else {
      this.logger.warn(
        'GitHub API Key not found. GitHub integration disabled.',
      );
    }
  }

  // Helper getters for dynamic values
  private async getUsername() {
    return (
      (await this.settingsService.getDecryptedSetting('github_username')) ||
      this.configService.get<string>('GITHUB_USERNAME')
    );
  }

  private async getRepoName() {
    return (
      (await this.settingsService.getDecryptedSetting('github_repo_name')) ||
      this.configService.get<string>('GITHUB_REPO_NAME')
    );
  }

  async getPublicRepos() {
    const username = await this.getUsername();
    if (!this.octokit || !username) return [];
    try {
      const { data } = await this.octokit.request(
        'GET /users/{username}/repos',
        {
          username: username,
          sort: 'updated',
          per_page: 10,
          type: 'public',
        },
      );
      return data;
    } catch (error) {
      this.logger.error('Failed to fetch public repos', error);
      return [];
    }
  }

  async getWorkflowRuns() {
    const username = await this.getUsername();
    const repoName = await this.getRepoName();

    if (!this.octokit || !username || !repoName) return [];
    try {
      const { data } = await this.octokit.request(
        'GET /repos/{owner}/{repo}/actions/runs',
        {
          owner: username,
          repo: repoName,
          per_page: 5,
        },
      );
      return data.workflow_runs.map((run) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        created_at: run.created_at,
        updated_at: run.updated_at,
        html_url: run.html_url,
        run_number: run.run_number,
        display_title: run.display_title,
        actor: {
          login: run.actor?.login,
          avatar_url: run.actor?.avatar_url,
        },
        duration:
          run.updated_at && run.created_at
            ? new Date(run.updated_at).getTime() -
            new Date(run.created_at).getTime()
            : 0,
      }));
    } catch (error) {
      if (error.status === 404) {
        this.logger.warn(
          `Repository ${username}/${repoName} not found or token lacks permissions. Check GITHUB_REPO_NAME and token scopes.`,
        );
      } else {
        this.logger.error('Failed to fetch workflow runs', error);
      }
      return [];
    }
  }
}
