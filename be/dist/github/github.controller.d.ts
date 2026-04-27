import { GithubService } from './github.service';
export declare class GithubController {
    private readonly githubService;
    constructor(githubService: GithubService);
    getPublicRepos(): Promise<any>;
    getDeployments(): Promise<any>;
    getLatestActivity(): Promise<{
        type: any;
        repo: any;
        isPrivate: boolean;
        timestamp: any;
        url: string;
    }>;
}
