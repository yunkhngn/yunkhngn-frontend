import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        id: number;
        settingTitle: string;
        content: string | null;
    }[]>;
    update(updateSettingsDto: UpdateSettingsDto): Promise<{
        id: number;
        settingTitle: string;
        content: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        settingTitle: string;
        content: string | null;
    }>;
}
