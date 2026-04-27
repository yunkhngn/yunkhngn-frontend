import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
export declare class LastFmService implements OnModuleInit {
    private configService;
    private settingsService;
    private readonly logger;
    private readonly baseUrl;
    constructor(configService: ConfigService, settingsService: SettingsService);
    onModuleInit(): Promise<void>;
    private getApiKey;
    private getUsername;
    getRecentTrack(): Promise<{
        name: any;
        artist: any;
        album: any;
        art: any;
        url: any;
        isNowPlaying: boolean;
    }>;
}
