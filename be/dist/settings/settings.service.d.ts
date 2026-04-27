import { OnModuleInit } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
export declare class SettingsService implements OnModuleInit {
    private prisma;
    private encryptionService;
    constructor(prisma: PrismaService, encryptionService: EncryptionService);
    onModuleInit(): Promise<void>;
    getSettings(): Promise<{
        id: number;
        settingTitle: string;
        content: string | null;
    }[]>;
    findAll(): Promise<{
        id: number;
        settingTitle: string;
        content: string | null;
    }[]>;
    update(updateSettingsDto: UpdateSettingsDto): Promise<{
        id: number;
        settingTitle: string;
        content: string | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        settingTitle: string;
        content: string | null;
    }>;
    getDecryptedSetting(title: string): Promise<string>;
}
