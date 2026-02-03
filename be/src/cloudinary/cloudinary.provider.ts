import { v2 as cloudinary } from 'cloudinary';
import { SettingsService } from '../settings/settings.service';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  inject: [SettingsService],
  useFactory: async (settingsService: SettingsService) => {
    const cloudName = await settingsService.getDecryptedSetting('cloudinary_cloud_name');
    const apiKey = await settingsService.getDecryptedSetting('cloudinary_api_key');
    const apiSecret = await settingsService.getDecryptedSetting('cloudinary_api_secret');

    return cloudinary.config({
      cloud_name: cloudName || process.env.CLOUDINARY_CLOUD_NAME,
      api_key: apiKey || process.env.CLOUDINARY_API_KEY,
      api_secret: apiSecret || process.env.CLOUDINARY_API_SECRET,
    });
  },
};
