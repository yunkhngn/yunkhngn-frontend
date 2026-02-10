import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

export interface ProjectInfo {
  title: string;
  description: string;
  content: string;
  techStack: string[];
  tags: string[];
  demoLink: string;
}

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  private async getModel(): Promise<GenerativeModel> {
    let apiKey =
      await this.settingsService.getDecryptedSetting('gemini_api_key');

    if (!apiKey) {
      apiKey = this.configService.get<string>('GEMINI_API_KEY');
    }

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in Settings or Env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const model = await this.getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      if (error.status === 429) {
        throw new HttpException(
          'AI Service is busy (Rate Limit). Please try again in a minute.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new Error('Failed to generate content');
    }
  }

  async generateProjectInfo(
    repoUrl: string,
    language: string = 'vi',
  ): Promise<ProjectInfo> {
    try {
      // Extract owner and repo
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub URL');
      }
      const [, owner, repo] = match;

      // Fetch README
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers: {
            Accept: 'application/vnd.github.raw',
          },
        },
      );

      if (!readmeRes.ok) {
        throw new Error('Failed to fetch README');
      }

      const readmeContent = await readmeRes.text();

      // Generate info using Gemini
      const prompt = `
        Analyze the following README content and extract/generate the following information in JSON format.
        Please write the content in ${language === 'vi' ? 'Vietnamese' : 'English'}.

        {
          "title": "Project Title",
          "description": "A short, engaging description (max 200 chars)",
          "content": "Generate a full project introduction in clean HTML (TipTap-compatible) using only <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> (no <h1>). Summarize the project based on its README and codebase, including: (1) Overview of what the project does and why it exists; (2) Main technologies and why they fit; (3) Key features; (4) Technical challenges; (5) A 'What I Learned' section with 3–5 insights; (6) A complexity label (Beginner / Intermediate / Advanced) with justification. Do not include installation guides, commands, or code snippets. Focus only on describing the project itself in a clear, readable, structured HTML format.",
          "techStack": ["Tech 1", "Tech 2 (Max 5 most important items)"],
          "tags": ["Tag 1", "Tag 2 (Max 5 most important items)"],
          "demoLink": "URL if found, otherwise null"
        }

        README Content:
        ${readmeContent.slice(0, 10000)} // Limit content length
      `;

      const model = await this.getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Clean up JSON string (remove markdown code blocks if present)
      const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();

      return JSON.parse(jsonString) as ProjectInfo;
    } catch (error) {
      console.error('Error generating project info:', error);
      throw new Error('Failed to generate project info');
    }
  }
  async generateBlogContent(
    prompt: string,
    currentContent?: string,
    language: string = 'vi',
  ): Promise<{ title: string; tags: string[]; content: string }> {
    try {
      let systemPrompt = '';
      if (currentContent) {
        systemPrompt = `
                    You are a professional blog editor and writer.
                    The user wants you to EDIT or EXTEND the following blog content based on their instructions.
                    
                    Current Content (HTML):
                    ${currentContent}
                    
                    User Instructions: ${prompt}
                    
                    Output Requirements:
                    1. Return the response in strictly valid JSON format.
                    2. JSON Structure: 
                       {
                         "title": "A catchy, SEO-friendly title",
                         "tags": ["Tag1", "Tag2"], // Single-word tags, max 5
                         "content": "The FULL updated content in clean HTML format (TipTap-compatible)..."
                       }
                    3. For the 'content' field:
                        - Use <h2>, <h3> for headings (no <h1>).
                        - Use <p>, <ul>, <ol>, <li>, <strong>, <em>, blockquote, <pre><code> for formatting.
                        - Maintain the existing style and tone.
                    4. Write in ${language === 'vi' ? 'Vietnamese' : 'English'}.
                    5. Do NOT wrap the output in markdown code blocks (like \`\`\`json). Just return the raw JSON string.
                `;
      } else {
        systemPrompt = `
                    You are a professional blog writer.
                    The user wants you to WRITE a new blog post based on their instructions.
                    
                    User Instructions: ${prompt}
                    
                    Output Requirements:
                    1. Return the response in strictly valid JSON format.
                     2. JSON Structure: 
                       {
                         "title": "A catchy, SEO-friendly title",
                         "tags": ["Tag1", "Tag2"], // A list of single-word tags, max 5, e.g. ["Tech", "React"]
                         "content": "The FULL content in clean HTML format (TipTap-compatible)..."
                       }
                    3. For the 'content' field:
                        - Use <h2>, <h3> for headings (no <h1>).
                        - Use <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <pre><code> for formatting.
                        - Structure the post logically (Introduction, Body, Conclusion).
                    4. Write in ${language === 'vi' ? 'Vietnamese' : 'English'}.
                    5. Do NOT wrap the output in markdown code blocks (like \`\`\`json). Just return the raw JSON string.
                `;
      }

      const model = await this.getModel();
      const result = await model.generateContent(systemPrompt);
      const response = result.response;
      let text = response.text();

      // Clean up markdown code blocks if present (```json, ```, ```html, etc.)
      text = text
        .replace(/```(?:json|html)?\n?/g, '')
        .replace(/\n?```/g, '')
        .trim();

      // Try to extract JSON object from the response
      try {
        return JSON.parse(text);
      } catch {
        // Fallback: find the first { and last } to extract JSON
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
          try {
            return JSON.parse(jsonCandidate);
          } catch {
            console.warn(
              'Could not parse extracted JSON, returning raw content',
            );
          }
        }
        // Last resort: return the raw text as content
        return {
          title: '',
          tags: [],
          content: text,
        };
      }
    } catch (error) {
      console.error('Error generating blog content:', error);
      throw new Error('Failed to generate blog content');
    }
  }
  async generateDashboardSummary(
    stats: any,
    recentActivities: any[],
    language: string = 'vi',
  ): Promise<string> {
    try {
      const prompt = `
        Analyze the following dashboard data for a personal blog/portfolio website and generate a "Weekly Summary" and "Future Direction".
        
        Data:
        - Total Blogs: ${stats.blogs} (${stats.blogsPublished} published, ${stats.blogsDraft} drafts)
        - Total Projects: ${stats.projects}
        - Total Photos: ${stats.gallery}
        - Total Comments: ${stats.comments}
        - Mail System: ${stats.mailTotal} total interactions (${stats.mailReceived} received, ${stats.mailSent} responded)
        
        Recent Activity (Last few items):
        ${recentActivities
          .map(
            (a) =>
              `- [${a.type.toUpperCase()}] ${a.action}: ${a.title} (${new Date(a.timestamp).toLocaleDateString()})`,
          )
          .join('\n')}
        
        Task:
        1. Generate a "Weekly Summary" (HTML <ul>) highlighting key achievements and metrics.
        2. Provide "Strategic Suggestions" (HTML <ul>) for next week based on the data.
        
        Format:
        <h3>Weekly Summary</h3>
        <ul>...</ul>
        <h3>Future Direction</h3>
        <ul>...</ul>
        
        IMPORTANT: Respond in ${language === 'vi' ? 'Vietnamese' : 'English'}. Keep it professional but encouraging.
        `;

      const model = await this.getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      // Clean up markdown code blocks if present
      text = text.replace(/```html\n?|\n?```/g, '').trim();

      return text;
    } catch (error) {
      console.error('Error generating dashboard summary:', error);
      throw new Error('Failed to generate dashboard summary');
    }
  }
  async chatWithSystem(
    message: string,
    history: any[],
    language: string = 'vi',
  ) {
    // 1. Fetch all relevant data from DB
    const [blogs, projects, gallery] = await Promise.all([
      this.prisma.blog.findMany({
        select: { title: true, contentJSON: true, slug: true, status: true },
      }),
      this.prisma.project.findMany({
        select: { title: true, description: true, techStack: true },
      }),
      this.prisma.gallery.findMany({
        select: { caption: true, createdAt: true },
      }),
    ]);

    const langInstruction =
      language === 'vi'
        ? 'IMPORTANT: Always respond in Vietnamese.'
        : 'IMPORTANT: Always respond in English.';

    // 2. Construct System Context
    const systemContext = `
    You are the AI Assistant for the Admin Panel of Khoa Nguyen's Portfolio Website. You are going to assist Khoa Nguyễn, just call me Khoa.
    You have access to the full database of content. Use this to answer the user's questions accurately.

    Database Content:
    
    [BLOGS]
    ${blogs.map((b) => `- ${b.title} (${b.status}): ${b.contentJSON.substring(0, 200)}...`).join('\n')}

    [PROJECTS]
    ${projects.map((p) => `- ${p.title}: ${p.description} (Tech: ${p.techStack})`).join('\n')}

    [GALLERY]
    ${gallery.map((g) => `- Photo: ${g.caption} (${g.createdAt.toISOString()})`).join('\n')}

    Instructions:
    - Answer based on the provided content.
    - If asked about something not in the DB, say you don't have that info.
    - Be helpful, concise, and professional.
    - You can help draft content, analyze trends, or find specific info.
    - ${langInstruction}
    `;

    // 3. Construct Chat History for Gemini
    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: systemContext }],
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Understood. I am ready to assist you with the system data.',
          },
        ],
      },
      ...history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    // 4. Call Gemini API with chat history
    const model = await this.getModel();
    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return { response };
  }
}
