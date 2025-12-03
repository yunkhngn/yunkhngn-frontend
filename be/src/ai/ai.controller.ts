import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Post('generate')
  @UseGuards(FirebaseAuthGuard)
  async generate(@Body('prompt') prompt: string) {
    if (!prompt) {
      throw new Error('Prompt is required');
    }
    const text = await this.aiService.generateText(prompt);
    return { text };
  }

  @Post('project-info')
  @UseGuards(FirebaseAuthGuard)
  async generateProjectInfo(
    @Body('repoUrl') repoUrl: string,
    @Body('language') language: string,
  ) {
    if (!repoUrl) {
      throw new Error('Repo URL is required');
    }
    return this.aiService.generateProjectInfo(repoUrl, language);
  }
  @Post('blog-content')
  @UseGuards(FirebaseAuthGuard)
  async generateBlogContent(
    @Body('prompt') prompt: string,
    @Body('currentContent') currentContent: string,
    @Body('language') language: string,
  ) {
    if (!prompt) {
      throw new Error('Prompt is required');
    }
    const content = await this.aiService.generateBlogContent(
      prompt,
      currentContent,
      language,
    );
    return { content };
  }
  @Post('dashboard-summary')
  @UseGuards(FirebaseAuthGuard)
  async generateDashboardSummary(
    @Body('stats') stats: any,
    @Body('recentActivities') recentActivities: any[],
    @Body('language') language: string,
  ) {
    if (!stats) {
      throw new Error('Stats are required');
    }
    const summary = await this.aiService.generateDashboardSummary(
      stats,
      recentActivities || [],
      language,
    );
    return { summary };
  }
}
