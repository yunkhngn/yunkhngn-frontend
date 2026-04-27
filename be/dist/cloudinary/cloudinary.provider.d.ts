import { SettingsService } from '../settings/settings.service';
export declare const CloudinaryProvider: {
    provide: string;
    inject: (typeof SettingsService)[];
    useFactory: (settingsService: SettingsService) => Promise<import("cloudinary").ConfigOptions>;
};
