import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ConfigModule, SettingsModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule { }
