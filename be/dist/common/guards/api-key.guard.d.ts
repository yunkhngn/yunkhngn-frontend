import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
export declare class ApiKeyGuard implements CanActivate {
    private settingsService;
    constructor(settingsService: SettingsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
