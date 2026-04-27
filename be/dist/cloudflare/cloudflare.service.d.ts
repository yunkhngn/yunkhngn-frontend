import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
export declare class CloudflareService {
    private configService;
    private settingsService;
    private readonly logger;
    constructor(configService: ConfigService, settingsService: SettingsService);
    getAnalytics(period?: '24h' | '7d' | '30d'): Promise<{
        chartData: any;
        totals: any;
    }>;
}
