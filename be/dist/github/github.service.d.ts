import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
export declare class GithubService implements OnModuleInit {
    private configService;
    private settingsService;
    private octokit;
    private readonly logger;
    constructor(configService: ConfigService, settingsService: SettingsService);
    onModuleInit(): Promise<void>;
    private getUsername;
    private getRepoName;
    getPublicRepos(): Promise<any>;
    getWorkflowRuns(): Promise<any>;
    getLatestActivity(): Promise<{
        type: any;
        repo: any;
        isPrivate: boolean;
        timestamp: any;
        url: string;
    }>;
}
