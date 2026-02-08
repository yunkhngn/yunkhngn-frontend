import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private settingsService: SettingsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key is missing');
    }

    const validApiKey =
      await this.settingsService.getDecryptedSetting('chat_api_key');

    if (!validApiKey) {
      // If no key is configured in settings, deny access by default to be safe
      throw new UnauthorizedException('API Key not configured on server');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
