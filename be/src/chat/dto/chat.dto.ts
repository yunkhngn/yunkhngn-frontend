import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  history?: string; // JSON string of previous messages if needed, or handle in frontend

  @IsString()
  @IsOptional()
  @IsIn(['gemini', 'ollama'])
  provider?: string; // Allow users to override AI provider per request
}
