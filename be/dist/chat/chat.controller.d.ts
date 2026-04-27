import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(body: ChatMessageDto): Promise<{
        response: string;
        imageUrl: string;
    }>;
    externalChat(body: ChatMessageDto): Promise<{
        response: string;
        imageUrl: string;
    }>;
}
