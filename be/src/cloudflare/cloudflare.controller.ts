import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/analytics')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class CloudflareController {
  constructor(private readonly cloudflareService: CloudflareService) {}

  @Get()
  async getAnalytics(@Query('period') period: '24h' | '7d' | '30d') {
    return this.cloudflareService.getAnalytics(period);
  }
}
