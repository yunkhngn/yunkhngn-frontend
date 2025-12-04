import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubService implements OnModuleInit {
    private octokit: any;
    private readonly logger = new Logger(GithubService.name);
    private readonly username: string;
    private readonly repoName: string;

    constructor(private configService: ConfigService) {
        this.username = this.configService.get<string>('GITHUB_USERNAME');
        this.repoName = this.configService.get<string>('GITHUB_REPO_NAME');
    }

    async onModuleInit() {
        const token = this.configService.get<string>('GITHUB_API_KEY');

        if (!this.username) {
            this.logger.error('GITHUB_USERNAME is not defined in .env');
        }
        if (!this.repoName) {
            this.logger.error('GITHUB_REPO_NAME is not defined in .env');
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
            this.logger.warn('GITHUB_API_KEY not found. GitHub integration disabled.');
        }
    }

    async getPublicRepos() {
        if (!this.octokit || !this.username) return [];
        try {
            const { data } = await this.octokit.request('GET /users/{username}/repos', {
                username: this.username,
                sort: 'updated',
                per_page: 10,
                type: 'public',
            });
            return data;
        } catch (error) {
            this.logger.error('Failed to fetch public repos', error);
            return [];
        }
    }

    async getWorkflowRuns() {
        if (!this.octokit || !this.username || !this.repoName) return [];
        try {
            const { data } = await this.octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
                owner: this.username,
                repo: this.repoName,
                per_page: 5,
            });
            return data.workflow_runs.map(run => ({
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
                    avatar_url: run.actor?.avatar_url
                },
                duration: run.updated_at && run.created_at
                    ? new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()
                    : 0
            }));
        } catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Repository ${this.username}/${this.repoName} not found or token lacks permissions. Check GITHUB_REPO_NAME and token scopes.`);
            } else {
                this.logger.error('Failed to fetch workflow runs', error);
            }
            return [];
        }
    }
}
