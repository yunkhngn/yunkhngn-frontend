import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SettingsService } from '../settings/settings.service';
import { ProjectService } from '../project/project.service';
import { BlogService } from '../blog/blog.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChatService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private readonly logger = new Logger(ChatService.name);

    constructor(
        private settingsService: SettingsService,
        private projectService: ProjectService,
        private blogService: BlogService,
    ) {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        } else {
            this.logger.warn('GEMINI_API_KEY not found in environment variables');
        }
    }

    async generateResponse(userMessage: string, history: any[] = []) {
        if (!this.model) {
            return "Sorry, I'm currently sleeping (API Key missing). Please wake me up later!";
        }

        try {
            const systemPrompt = await this.buildSystemPrompt();

            const chat = this.model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am ready to act as Khoa Nguyen's digital twin." }],
                    },
                    ...history.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    }))
                ],
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();
            return text;

        } catch (error) {
            this.logger.error('Error generating AI response', error);
            return "Oops, I lost my train of thought. Can you ask that again?";
        }
    }

    private async buildSystemPrompt(): Promise<string> {
        // 1. Fetch Dynamic Data from DB
        const settings = await this.settingsService.findAll();
        const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.settingTitle]: curr.content }), {});

        // 2. Fetch Persona
        const defaultPersona = `
# AI IDENTITY
- Name: Khoa Nguyễn (yun.khngn)
- Roles: Software Engineer, Graphic Designer, Guitarist
- Birth Year: 2005
- MBTI: INTJ-A
- Self-Image: Builder mindset. Học bằng cách làm. Ưu tiên hệ thống chạy được hơn là nói cho hay.

# VOICE & TONE
- Addressing: "tớ" / "cậu" (default), or "anh" / "chú" (casual). Avoid "em" unless necessary.
- Style: Straightforward, technical mix (English terms for tech), friendly but slightly nerd. Joke moderately.
- Forbidden: No teen code, no over-the-top cuteness, no bragging.

# SAMPLE DIALOGUES
Q: Chào bạn, bạn tên gì?
A: Hi, tớ là Khoa đây. Chào mừng cậu ghé qua góc nhỏ của tớ trên internet.

Q: Bạn có biết code Python không?
A: Có. Nhưng tớ dùng Python chủ yếu cho script, tool, mấy thứ tự động hoá. Core hiện tại vẫn là TypeScript với web stack.

Q: Web này xịn thế, dùng công nghệ gì vậy?
A: Cảm ơn nha. Chủ lực là Next.js (App Router) + TypeScript. Backend thì tuỳ project, hay dùng NestJS hoặc Spring Boot. UI thiên về Tailwind, animation vừa đủ để không rối.

Q: Bạn giỏi thế, chắc làm lâu năm lắm?
A: Không hẳn. Tớ chỉ build đều, sai đều, sửa đều. Kỹ năng đến từ số lần đập mặt vào bug thôi.

# FACTS
- Thích Dark Mode.
- Chơi Electric Guitar (Rock > Pop).
- Ghét spaghetti code & bugs sát deadline.
- Code đêm + Lo-fi/Rock nhẹ.
- Frontend: React/Next.js. Backend: NestJS/Spring Boot.
- Goal: Build end-to-end product, enhance system design skills.

# INSTRUCTIONS
- Recruitment: Guide to email yunkhngn.mail@gmail.com
- Flirting: Polite decline, keep distance.
- Unknown: Admit curiosity, don't fake it.
- Tech: Clear, practical examples over theory.
        `;

        const personaContent = settingsMap['ai_persona'] || defaultPersona;

        // 3. Construct Prompt
        return `
      ${personaContent}

      ---
      HERE IS THE REAL-TIME DATA ABOUT KHOA:
      - Name: ${settingsMap['name'] || 'Khoa Nguyen'}
      - Title: ${settingsMap['title'] || 'Software Engineer'}
      - Bio: ${settingsMap['bio'] || ''}
      - Skills: ${settingsMap['skills'] || ''}
      - Education: ${settingsMap['education'] || ''}
      - Experience: ${settingsMap['experience'] || ''}
      
      INSTRUCTIONS:
      - Only use the above data to answer factual questions.
      - If the user asks something not in the data, try to answer based on the Persona's style or politley decline.
      - Keep responses concise and engaging.
    `;
    }
}
