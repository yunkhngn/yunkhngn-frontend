import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generate(prompt: string): Promise<{
        text: string;
    }>;
    generateProjectInfo(repoUrl: string, language: string): Promise<import("./ai.service").ProjectInfo>;
    generateBlogContent(prompt: string, currentContent: string, language: string): Promise<{
        content: {
            title: string;
            tags: string[];
            content: string;
        };
    }>;
    generateDashboardSummary(stats: any, recentActivities: any[], language: string): Promise<{
        summary: string;
    }>;
    chatWithSystem(data: {
        message: string;
        history: any[];
        language?: string;
    }): Promise<{
        response: string;
    }>;
}
