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
}
