import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(ThrottlerGuard) // Undo comment when Rate Limiter is configured globally
  async chat(@Body() body: ChatMessageDto) {
    // Basic formatting for history
    let history = [];
    try {
      if (body.history) {
        history = JSON.parse(body.history);
      }
    } catch {
      // ignore invalid history
    }

    const response = await this.chatService.generateResponse(
      body.message,
      history,
    );
    return { response };
  }
}
