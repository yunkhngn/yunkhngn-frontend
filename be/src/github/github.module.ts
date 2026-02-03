import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ConfigModule, SettingsModule],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule { }
