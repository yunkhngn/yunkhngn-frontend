import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('stats')
  @UseGuards(FirebaseAuthGuard)
  async getStats() {
    return this.systemService.getStats();
  }
}
