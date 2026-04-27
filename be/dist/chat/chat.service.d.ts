import { SettingsService } from '../settings/settings.service';
import { ProjectService } from '../project/project.service';
import { BlogService } from '../blog/blog.service';
export declare class ChatService {
    private settingsService;
    private projectService;
    private blogService;
    private readonly logger;
    constructor(settingsService: SettingsService, projectService: ProjectService, blogService: BlogService);
    private isImageRequest;
    private generateImage;
    generateResponse(userMessage: string, history?: any[]): Promise<{
        text: string;
        imageUrl?: string;
    }>;
    private buildSystemPrompt;
}
