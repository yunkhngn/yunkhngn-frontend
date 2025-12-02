import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface ProjectInfo {
  title: string;
  description: string;
  content: string;
  techStack: string[];
  tags: string[];
  demoLink: string;
}

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
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

      const result = await this.model.generateContent(prompt);
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
  ): Promise<string> {
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
                    1. Return the FULL updated content in clean HTML format (TipTap-compatible).
                    2. Use <h2>, <h3> for headings (no <h1>).
                    3. Use <p>, <ul>, <ol>, <li>, <strong>, <em>, blockquote, <pre><code> for formatting.
                    4. Maintain the existing style and tone.
                    5. Write in ${language === 'vi' ? 'Vietnamese' : 'English'}.
                    6. Do NOT wrap the output in markdown code blocks (like \`\`\`html). Just return the raw HTML string.
                `;
      } else {
        systemPrompt = `
                    You are a professional blog writer.
                    The user wants you to WRITE a new blog post based on their instructions.
                    
                    User Instructions: ${prompt}
                    
                    Output Requirements:
                    1. Return the FULL content in clean HTML format (TipTap-compatible).
                    2. Use <h2>, <h3> for headings (no <h1>).
                    3. Use <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <pre><code> for formatting.
                    4. Structure the post logically (Introduction, Body, Conclusion).
                    5. Write in ${language === 'vi' ? 'Vietnamese' : 'English'}.
                    6. Do NOT wrap the output in markdown code blocks (like \`\`\`html). Just return the raw HTML string.
                `;
      }

      const result = await this.model.generateContent(systemPrompt);
      const response = result.response;
      let text = response.text();

      // Clean up markdown code blocks if present
      text = text.replace(/```html\n?|\n?```/g, '').trim();

      return text;
    } catch (error) {
      console.error('Error generating blog content:', error);
      throw new Error('Failed to generate blog content');
    }
  }
}
