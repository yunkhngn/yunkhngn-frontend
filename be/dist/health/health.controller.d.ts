import { SettingsService } from '../settings/settings.service';
export declare class HealthController {
    private settingsService;
    constructor(settingsService: SettingsService);
    check(): Promise<{
        status: string;
        timestamp: string;
        services: {
            gemini: boolean;
            resend: boolean;
            cloudflare: boolean;
            cloudinary: boolean;
            github: boolean;
        };
    }>;
}
