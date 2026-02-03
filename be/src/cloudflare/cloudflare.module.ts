import { Module } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { CloudflareController } from './cloudflare.controller';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ConfigModule, SettingsModule],
  controllers: [CloudflareController],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}
