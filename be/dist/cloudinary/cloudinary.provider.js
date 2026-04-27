"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = void 0;
const cloudinary_1 = require("cloudinary");
const settings_service_1 = require("../settings/settings.service");
exports.CloudinaryProvider = {
    provide: 'CLOUDINARY',
    inject: [settings_service_1.SettingsService],
    useFactory: async (settingsService) => {
        const cloudName = await settingsService.getDecryptedSetting('cloudinary_cloud_name');
        const apiKey = await settingsService.getDecryptedSetting('cloudinary_api_key');
        const apiSecret = await settingsService.getDecryptedSetting('cloudinary_api_secret');
        return cloudinary_1.v2.config({
            cloud_name: cloudName || process.env.CLOUDINARY_CLOUD_NAME,
            api_key: apiKey || process.env.CLOUDINARY_API_KEY,
            api_secret: apiSecret || process.env.CLOUDINARY_API_SECRET,
        });
    },
};
//# sourceMappingURL=cloudinary.provider.js.map