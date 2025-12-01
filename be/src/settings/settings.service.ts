import { Injectable } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getSettings() {
        return this.prisma.settings.findMany({
            orderBy: { id: 'asc' }
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
        return this.prisma.settings.delete({ where: { id } });
    }
}
