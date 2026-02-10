import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body('email') email: string) {
    return this.newsletterService.subscribe(email);
  }

  @Get('unsubscribe')
  async unsubscribe(@Query('token') token: string) {
    return this.newsletterService.unsubscribe(token);
  }

  @Post('send')
  @UseGuards(FirebaseAuthGuard)
  async send(@Body() body: { subject: string; content: string }) {
    return this.newsletterService.sendToAll(body.subject, body.content);
  }
}
