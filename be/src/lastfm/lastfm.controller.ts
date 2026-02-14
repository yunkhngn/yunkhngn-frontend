import { Controller, Get } from '@nestjs/common';
import { LastFmService } from './lastfm.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('LastFm')
@Controller('lastfm')
export class LastFmController {
  constructor(private readonly lastFmService: LastFmService) {}

  @Get('playing')
  @ApiOperation({ summary: 'Get currently playing or last played track' })
  getNowPlaying() {
    return this.lastFmService.getRecentTrack();
  }
}
