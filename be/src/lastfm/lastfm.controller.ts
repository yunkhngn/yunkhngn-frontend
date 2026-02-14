import { Controller, Get, Header } from '@nestjs/common';
import { LastFmService } from './lastfm.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('LastFm')
@Controller('lastfm')
export class LastFmController {
  constructor(private readonly lastFmService: LastFmService) { }

  @Get('playing')
  @ApiOperation({ summary: 'Get currently playing or last played track' })
  getNowPlaying() {
    return this.lastFmService.getRecentTrack();
  }

  @Get('widget')
  @Header('Content-Type', 'image/svg+xml')
  @Header('Cache-Control', 's-maxage=60, stale-while-revalidate')
  @ApiOperation({ summary: 'Get SVG widget for GitHub profile' })
  async getWidget() {
    const track = await this.lastFmService.getRecentTrack();

    // Default values if no track
    const data = track || {
      name: 'Nothing playing',
      artist: '',
      art: '',
      isNowPlaying: false,
    };

    // Clean data for XML
    const escapeXml = (unsafe: string) =>
      unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
        }
      });

    const name = escapeXml(data.name || 'Unknown Track');
    const artist = escapeXml(data.artist || 'Unknown Artist');
    const art = data.art || 'https://raw.githubusercontent.com/yunkhngn/yunkhngn/main/assets/disc.png'; // Fallback
    const isPlaying = data.isNowPlaying;

    const width = 300;
    const height = 80;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
          .text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; }
          .title { font-weight: bold; font-size: 14px; fill: #ffffff; }
          .artist { font-size: 12px; fill: #a1a1aa; }
          .label { font-size: 10px; font-weight: 500; fill: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; }
          .animate-spin { animation: spin 3s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        </style>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" rx="16" fill="#18181b" stroke="#27272a" stroke-width="1"/>
        
        <!-- Album Art -->
        <defs>
          <clipPath id="clip">
            <rect x="12" y="12" width="56" height="56" rx="8" />
          </clipPath>
        </defs>
        <image x="12" y="12" width="56" height="56" href="${art}" clip-path="url(#clip)" />
        
        <!-- Status Indicator -->
        ${isPlaying ? `
          <g transform="translate(200, 25)">
             <circle cx="80" cy="-6" r="4" fill="#22c55e">
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
             </circle>
          </g>
        ` : ''}

        <!-- Text Content -->
        <g transform="translate(80, 26)">
          <text x="0" y="0" class="text label">${isPlaying ? 'Vibing to' : 'Last played'}</text>
          <text x="0" y="18" class="text title">${name.length > 30 ? name.substring(0, 28) + '...' : name}</text>
          <text x="0" y="36" class="text artist">${artist.length > 35 ? artist.substring(0, 33) + '...' : artist}</text>
        </g>
      </svg>
    `.trim();
  }
}
