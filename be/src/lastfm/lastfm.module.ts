import { Module } from '@nestjs/common';
import { LastFmService } from './lastfm.service';
import { LastFmController } from './lastfm.controller';
import { SettingsModule } from '../settings/settings.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SettingsModule, ConfigModule],
  controllers: [LastFmController],
  providers: [LastFmService],
  exports: [LastFmService],
})
export class LastFmModule {}
