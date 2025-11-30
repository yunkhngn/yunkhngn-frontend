import { Injectable } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getSettings() {
        let settings = await this.prisma.settings.findUnique({
            where: { id: 1 },
        });

        if (!settings) {
            settings = await this.prisma.settings.create({
                data: {
                    id: 1,
                    siteTitle: 'My Developer Portfolio',
                    bio: 'Welcome to my blog and portfolio.',
                },
            });
        }

        return settings;
    }

    async update(updateSettingsDto: UpdateSettingsDto) {
        // Ensure settings exist
        await this.getSettings();

        return this.prisma.settings.update({
            where: { id: 1 },
            data: updateSettingsDto,
        });
    }
}
