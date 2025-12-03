import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PrismaService } from '../prisma/prisma.service';

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
];

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    for (const title of SYSTEM_SETTINGS) {
      await this.prisma.settings.upsert({
        where: { settingTitle: title },
        update: {},
        create: {
          settingTitle: title,
          content: '',
        },
      });
    }
  }

  async getSettings() {
    return this.prisma.settings.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async update(updateSettingsDto: UpdateSettingsDto) {
    const { settingTitle, content } = updateSettingsDto;

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
}
