import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly ivLength = 16; // For AES, this is always 16

  constructor(private configService: ConfigService) {
    const keyString = this.configService.get<string>('ENCRYPTION_KEY');
    if (!keyString) {
      // In development if not set, we can warn or throw.
      // For now, let's warn and fallback or throw to ensure security.
      // throw new Error('ENCRYPTION_KEY is not defined');
      console.warn(
        'ENCRYPTION_KEY is not defined. Using a default INSECURE key for development ONLY.',
      );
      this.key = crypto.scryptSync('development-fallback-key', 'salt', 32);
    } else {
      // Ensure key is 32 bytes
      this.key = Buffer.from(keyString, 'hex');
      if (this.key.length !== 32) {
        // If the user provided a string that isn't hex or wrong length, try to hash it to 32 bytes
        this.key = crypto.scryptSync(keyString, 'salt', 32);
      }
    }
  }

  encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(text: string): string {
    if (!text) return text;
    try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (e) {
      console.error('Decryption failed:', e);
      return text; // Return original if decryption fails (e.g. if it wasn't encrypted)
    }
  }
}
