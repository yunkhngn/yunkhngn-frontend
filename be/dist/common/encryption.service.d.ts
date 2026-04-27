import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private readonly algorithm;
    private readonly key;
    private readonly ivLength;
    constructor(configService: ConfigService);
    encrypt(text: string): string;
    decrypt(text: string): string;
}
