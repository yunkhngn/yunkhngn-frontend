"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GithubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const settings_service_1 = require("../settings/settings.service");
let GithubService = GithubService_1 = class GithubService {
    constructor(configService, settingsService) {
        this.configService = configService;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(GithubService_1.name);
    }
    async onModuleInit() {
        const token = (await this.settingsService.getDecryptedSetting('github_api_key')) ||
            this.configService.get('GITHUB_API_KEY');
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
                const { Octokit } = await eval('import("octokit")');
                this.octokit = new Octokit({ auth: token });
            }
            catch (error) {
                this.logger.error('Failed to load Octokit', error);
            }
        }
        else {
            this.logger.warn('GitHub API Key not found. GitHub integration disabled.');
        }
    }
    async getUsername() {
        return ((await this.settingsService.getDecryptedSetting('github_username')) ||
            this.configService.get('GITHUB_USERNAME'));
    }
    async getRepoName() {
        return ((await this.settingsService.getDecryptedSetting('github_repo_name')) ||
            this.configService.get('GITHUB_REPO_NAME'));
    }
    async getPublicRepos() {
        const username = await this.getUsername();
        if (!this.octokit || !username)
            return [];
        try {
            const { data } = await this.octokit.request('GET /users/{username}/repos', {
                username: username,
                sort: 'updated',
                per_page: 10,
                type: 'public',
            });
            return data;
        }
        catch (error) {
            this.logger.error('Failed to fetch public repos', error);
            return [];
        }
    }
    async getWorkflowRuns() {
        const username = await this.getUsername();
        const repoName = await this.getRepoName();
        if (!this.octokit || !username || !repoName)
            return [];
        try {
            const { data } = await this.octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
                owner: username,
                repo: repoName,
                per_page: 5,
            });
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
                duration: run.updated_at && run.created_at
                    ? new Date(run.updated_at).getTime() -
                        new Date(run.created_at).getTime()
                    : 0,
            }));
        }
        catch (error) {
            if (error.status === 404) {
                this.logger.warn(`Repository ${username}/${repoName} not found or token lacks permissions. Check GITHUB_REPO_NAME and token scopes.`);
            }
            else {
                this.logger.error('Failed to fetch workflow runs', error);
            }
            return [];
        }
    }
    async getLatestActivity() {
        const username = await this.getUsername();
        if (!this.octokit || !username)
            return null;
        try {
            const { data } = await this.octokit.request('GET /users/{username}/events', {
                username,
                per_page: 10,
            });
            const relevantEvent = data.find((e) => [
                'PushEvent',
                'PullRequestEvent',
                'WatchEvent',
                'CreateEvent',
                'IssuesEvent',
            ].includes(e.type));
            if (!relevantEvent)
                return null;
            const isPrivate = !relevantEvent.public;
            return {
                type: relevantEvent.type,
                repo: isPrivate ? 'Private Repository' : relevantEvent.repo.name,
                isPrivate,
                timestamp: relevantEvent.created_at,
                url: isPrivate ? null : `https://github.com/${relevantEvent.repo.name}`,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch user events', error);
            return null;
        }
    }
};
exports.GithubService = GithubService;
exports.GithubService = GithubService = GithubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        settings_service_1.SettingsService])
], GithubService);
//# sourceMappingURL=github.service.js.map