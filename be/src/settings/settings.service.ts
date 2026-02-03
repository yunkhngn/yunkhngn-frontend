import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';

const SYSTEM_SETTINGS = [
  'bio',
  'quote',
  'facebook',
  'github',
  'instagram',
  'linkedin',
  'email',
  'homepage_description',
  'footer_description',
  'about_content',
  'comment_forbidden_keywords',
  'education',
  'experience',
  'skills',
  'cv_url',
  'gemini_api_key',
  'cloudinary_cloud_name',
  'cloudinary_api_key',
  'cloudinary_api_secret',
];

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) { }

  async onModuleInit() {
    try {
      for (const title of SYSTEM_SETTINGS) {
        await this.prisma.settings.upsert({
          where: { settingTitle: title },
          update: { settingTitle: title },
          create: {
            settingTitle: title,
            content: '',
          },
        });
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    }
  }

  async getSettings() {
    const settings = await this.prisma.settings.findMany({
      orderBy: { id: 'asc' },
    });

    return settings.map((s) => {
      // Mask sensitive keys
      if (
        (s.settingTitle === 'gemini_api_key' ||
          s.settingTitle === 'cloudinary_api_secret') &&
        s.content
      ) {
        return { ...s, content: '********' };
      }
      return s;
    });
  }

  async update(updateSettingsDto: UpdateSettingsDto) {
    const { settingTitle } = updateSettingsDto;
    let { content } = updateSettingsDto;

    // Encrypt sensitive keys
    if (
      settingTitle === 'gemini_api_key' ||
      settingTitle === 'cloudinary_api_secret'
    ) {
      if (content === '********') {
        // Ignore update if it's the mask
        return;
      }
      content = this.encryptionService.encrypt(content);
    }

    return this.prisma.settings.upsert({
      where: { settingTitle },
      update: { content },
      create: { settingTitle, content },
    });
  }

  async delete(id: number) {
    const setting = await this.prisma.settings.findUnique({ where: { id } });
    if (setting && SYSTEM_SETTINGS.includes(setting.settingTitle)) {
      throw new BadRequestException(
        `Cannot delete system setting: ${setting.settingTitle}`,
      );
    }
    return this.prisma.settings.delete({ where: { id } });
  }

  async getDecryptedSetting(title: string): Promise<string> {
    const setting = await this.prisma.settings.findUnique({
      where: { settingTitle: title },
    });

    if (!setting || !setting.content) return null;

    if (
      title === 'gemini_api_key' ||
      title === 'cloudinary_api_secret'
    ) {
      return this.encryptionService.decrypt(setting.content);
    }

    return setting.content;
  }
}
