import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
export interface ProjectInfo {
    title: string;
    description: string;
    content: string;
    techStack: string[];
    tags: string[];
    demoLink: string;
}
export declare class AiService {
    private configService;
    private prisma;
    private settingsService;
    constructor(configService: ConfigService, prisma: PrismaService, settingsService: SettingsService);
    private getModel;
    generateText(prompt: string): Promise<string>;
    generateProjectInfo(repoUrl: string, language?: string): Promise<ProjectInfo>;
    generateBlogContent(prompt: string, currentContent?: string, language?: string): Promise<{
        title: string;
        tags: string[];
        content: string;
    }>;
    generateDashboardSummary(stats: any, recentActivities: any[], language?: string): Promise<string>;
    chatWithSystem(message: string, history: any[], language?: string): Promise<{
        response: string;
    }>;
}
