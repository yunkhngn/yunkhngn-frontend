"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const genai_1 = require("@google/genai");
const settings_service_1 = require("../settings/settings.service");
const project_service_1 = require("../project/project.service");
const blog_service_1 = require("../blog/blog.service");
const cloudinary_1 = require("cloudinary");
const IMAGE_KEYWORDS_VI = [
    'vẽ',
    'tạo ảnh',
    'tạo hình',
    'sinh ảnh',
    'gen ảnh',
    'generate image',
    'draw',
    'create image',
    'create picture',
    'make image',
    'make picture',
    'draw me',
    'vẽ cho',
    'tạo cho',
    'thiết kế',
];
let ChatService = ChatService_1 = class ChatService {
    constructor(settingsService, projectService, blogService) {
        this.settingsService = settingsService;
        this.projectService = projectService;
        this.blogService = blogService;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    isImageRequest(message) {
        const lower = message.toLowerCase();
        return IMAGE_KEYWORDS_VI.some((kw) => lower.includes(kw));
    }
    async generateImage(prompt, apiKey) {
        try {
            const ai = new genai_1.GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: prompt,
                config: {
                    responseModalities: ['Text', 'Image'],
                },
            });
            let text = '';
            let imageUrl = null;
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    text += part.text;
                }
                else if (part.inlineData) {
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    const dataUri = `data:${mimeType};base64,${part.inlineData.data}`;
                    try {
                        const uploadResult = await cloudinary_1.v2.uploader.upload(dataUri, {
                            folder: 'blog-portfolio/chat-generated',
                            resource_type: 'image',
                        });
                        imageUrl = uploadResult.secure_url;
                    }
                    catch (uploadError) {
                        this.logger.error('Failed to upload generated image to Cloudinary', uploadError);
                    }
                }
            }
            if (!text && imageUrl) {
                text = 'Đây nha! Tớ vừa vẽ xong cho cậu rồi đó 🎨';
            }
            else if (!text && !imageUrl) {
                text =
                    'Hmm, tớ không vẽ được ảnh này. Cậu thử mô tả lại chi tiết hơn nhé!';
            }
            return { text, imageUrl };
        }
        catch (error) {
            this.logger.error('Error generating image', error);
            if (error.status === 429 || error.message?.includes('429')) {
                return {
                    text: 'Tớ đang bị quá tải rồi cậu ơi (Rate Limit). Đợi một chút rồi thử lại nhé! 🤯',
                    imageUrl: null,
                };
            }
            return {
                text: 'Hmm, tớ gặp lỗi khi vẽ ảnh rồi. Cậu thử lại sau nhé! 😅',
                imageUrl: null,
            };
        }
    }
    async generateResponse(userMessage, history = []) {
        const settings = await this.settingsService.findAll();
        const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.settingTitle]: curr.content }), {});
        const MAX_WORD_COUNT = 100;
        const wordCount = userMessage.split(/\s+/).length;
        if (wordCount > MAX_WORD_COUNT) {
            throw new common_1.BadRequestException(`Message is too long. Limit is ${MAX_WORD_COUNT} words.`);
        }
        const forbiddenWordsRaw = settingsMap['chat_forbidden_words'];
        if (forbiddenWordsRaw) {
            const forbiddenWords = forbiddenWordsRaw
                .split(/[,\n]+/)
                .map((w) => w.trim().toLowerCase())
                .filter(Boolean);
            const lowerCaseMessage = userMessage.toLowerCase();
            const foundForbidden = forbiddenWords.find((word) => lowerCaseMessage.includes(word));
            if (foundForbidden) {
                throw new common_1.BadRequestException('Your message contains prohibited words.');
            }
        }
        let apiKeyString = process.env.GEMINI_API_KEY;
        if (!apiKeyString) {
            apiKeyString = settingsMap['gemini_api_key'];
        }
        if (!apiKeyString) {
            return {
                text: 'Xin lỗi, tớ đang ngủ (Thiếu API Key). Đánh thức tớ sau nhé! 😴',
            };
        }
        const apiKeys = apiKeyString
            .split(',')
            .map((k) => k.trim())
            .filter((k) => k);
        const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
        if (this.isImageRequest(userMessage)) {
            const result = await this.generateImage(userMessage, apiKey);
            return { text: result.text, imageUrl: result.imageUrl || undefined };
        }
        const systemPrompt = await this.buildSystemPrompt();
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-3-flash-preview',
            });
            const geminiHistory = history.slice(-4).map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));
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
            if (geminiHistory.length > 0) {
                if (geminiHistory[0].role === 'model') {
                    chatHistory[1].parts[0].text +=
                        '\n\n' + geminiHistory[0].parts[0].text;
                    geminiHistory.shift();
                }
            }
            const chat = model.startChat({
                history: [...chatHistory, ...geminiHistory],
            });
            const result = await chat.sendMessage(userMessage);
            const response = result.response;
            const text = response.text();
            return { text };
        }
        catch (error) {
            this.logger.error('Error generating AI response', error);
            if (error.status === 429 || error.message?.includes('429')) {
                return {
                    text: 'Xin lỗi cậu, tớ đang bị quá tải (Rate Limit). Đợi một chút rồi hỏi lại tớ nhé! 🤯',
                };
            }
            return {
                text: 'U là trời, tớ quên mất mình định nói gì rồi. Cậu hỏi lại được không? 😅',
            };
        }
    }
    async buildSystemPrompt() {
        const settings = await this.settingsService.findAll();
        const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.settingTitle]: curr.content }), {});
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
            ? settingsMap['ai_persona']
            : defaultPersona;
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
            const content = b.contentJSON ? b.contentJSON.substring(0, 1200) : (b.content ? b.content.substring(0, 1200) : '');
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
            const content = p.contentJSON ? p.contentJSON.substring(0, 1200) : (p.content ? p.content.substring(0, 1200) : '');
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
      - 🎨 IMAGE GENERATION: You can generate images! If the user asks you to draw/create/generate an image, the system will handle it automatically. No need to decline image requests.
    `;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        project_service_1.ProjectService,
        blog_service_1.BlogService])
], ChatService);
//# sourceMappingURL=chat.service.js.map