import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SettingsService } from '../settings/settings.service';
import { ProjectService } from '../project/project.service';
import { BlogService } from '../blog/blog.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private settingsService: SettingsService,
    private projectService: ProjectService,
    private blogService: BlogService,
  ) {}

  async generateResponse(userMessage: string, history: any[] = []) {
    const settings = await this.settingsService.findAll();
    const settingsMap = settings.reduce(
      (acc, curr) => ({ ...acc, [curr.settingTitle]: curr.content }),
      {},
    );

    const systemPrompt = await this.buildSystemPrompt();

    // 1. Get API Key (Env or DB)
    let apiKeyString = process.env.GEMINI_API_KEY;
    if (!apiKeyString) {
      apiKeyString = settingsMap['gemini_api_key'];
    }

    if (!apiKeyString) {
      return 'Xin lỗi, tớ đang ngủ (Thiếu API Key). Đánh thức tớ sau nhé! 😴';
    }

    // Support multiple keys (comma separated)
    const apiKeys = apiKeyString
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    try {
      // 2. Init SDK on the fly
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Reuse systemPrompt built above

      // Limit history to last 4 messages for Gemini to save tokens
      const geminiHistory = history.slice(-4).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Base interaction: User (System) -> Model (Ack)
      const chatHistory = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'Hiểu rồi. Tớ sẽ đóng vai là phiên bản kỹ thuật số của Khoa Nguyễn.',
            },
          ],
        },
      ];

      // Merge history to ensure no Model -> Model violation at the start
      if (geminiHistory.length > 0) {
        if (geminiHistory[0].role === 'model') {
          // Append the first model message to the Ack message
          chatHistory[1].parts[0].text +=
            '\n\n' + geminiHistory[0].parts[0].text;
          // Remove it from the history array we append
          geminiHistory.shift();
        }
      }

      const chat = model.startChat({
        history: [...chatHistory, ...geminiHistory],
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      const text = response.text();
      return text;
    } catch (error) {
      this.logger.error('Error generating AI response', error);
      if (error.status === 429 || error.message?.includes('429')) {
        return 'Xin lỗi cậu, tớ đang bị quá tải (Rate Limit). Đợi một chút rồi hỏi lại tớ nhé! 🤯';
      }
      return 'U là trời, tớ quên mất mình định nói gì rồi. Cậu hỏi lại được không? 😅';
    }
  }

  private async buildSystemPrompt(): Promise<string> {
    // 1. Fetch Dynamic Data from DB
    const settings = await this.settingsService.findAll();
    const settingsMap = settings.reduce(
      (acc, curr) => ({ ...acc, [curr.settingTitle]: curr.content }),
      {},
    );

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

    const personaContent = settingsMap['ai_persona']
      ? settingsMap['ai_persona'] // User's custom persona
      : defaultPersona;

    // 3. Construct Prompt
    return `
      ${personaContent}

      ---
      HERE IS THE REAL-TIME DATA ABOUT KHOA:
      - Name: ${settingsMap['name'] || 'Khoa Nguyen'}
      - Title: ${settingsMap['title'] || 'Software Engineer'}
      - Skills: ${settingsMap['skills'] || ''}
      - Education: ${settingsMap['education'] || ''}
      - Experience: ${settingsMap['experience'] || ''}

      ---
      WEBSITE CONTENT (RAG DATA):
      
      [LATEST BLOG POSTS]
      ${(await this.blogService.findAll())
        .slice(0, 5)
        .map((b) => {
          // Truncate to ~200 words
          const content = b.contentJSON ? b.contentJSON.substring(0, 1200) : '';
          const truncated = content.split(' ').slice(0, 200).join(' ');
          return `- Title: ${b.title}
        Link: /blog/${b.slug}
        Preview: ${truncated}...`;
        })
        .join('\n\n')}

      [FEATURED PROJECTS]
      ${(await this.projectService.findAll())
        .slice(0, 5)
        .map((p) => {
          // Truncate to ~200 words
          const content = p.contentJSON ? p.contentJSON.substring(0, 1200) : '';
          const truncated = content.split(' ').slice(0, 200).join(' ');
          return `- Title: ${p.title}
        Link: /projects/${p.id}
        Preview: ${truncated}...`;
        })
        .join('\n\n')}
      
      INSTRUCTIONS:
      - Only use the above data to answer factual questions.
      - If the user asks something not in the data, try to answer based on the Persona's style or politley decline.
      - Keep responses concise and engaging.
      - ⚠️ KEY RULE: When providing a link to a blog or project, YOU MUST format it as a valid Markdown link.
        Example: "Cậu đọc bài này nhé: [Tiêu đề bài viết](/blog/slug)"
        Do NOT just output the raw path like "/blog/slug".
    `;
  }
}
