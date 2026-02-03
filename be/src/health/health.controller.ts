import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from '../settings/settings.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private settingsService: SettingsService) { }

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    const cloudName =
      (await this.settingsService.getDecryptedSetting(
        'cloudinary_cloud_name',
      )) || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey =
      (await this.settingsService.getDecryptedSetting('cloudinary_api_key')) ||
      process.env.CLOUDINARY_API_KEY;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        gemini: !!process.env.GEMINI_API_KEY,
        resend: !!process.env.RESEND_API_KEY,
        cloudflare: !!(
          process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN
        ),
        cloudinary: !!(cloudName && apiKey),
      },
    };
  }
}
