import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating content:', error);
            throw new Error('Failed to generate content');
        }
    }

    async generateProjectInfo(repoUrl: string): Promise<any> {
        try {
            // Extract owner and repo
            const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match) {
                throw new Error('Invalid GitHub URL');
            }
            const [, owner, repo] = match;

            // Fetch README
            const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
                headers: {
                    Accept: 'application/vnd.github.raw',
                },
            });

            if (!readmeRes.ok) {
                throw new Error('Failed to fetch README');
            }

            const readmeContent = await readmeRes.text();

            // Generate info using Gemini
            const prompt = `
        Analyze the following README content and extract/generate the following information in JSON format:
        {
          "title": "Project Title",
          "description": "A short, engaging description (max 200 chars)",
          "content": "A detailed explanation of the project in Markdown format. Include features, installation, and usage if available. Do not use H1 (#). Use H2 (##) and below.",
          "techStack": ["Tech 1", "Tech 2"],
          "tags": ["Tag 1", "Tag 2"],
          "demoLink": "URL if found, otherwise null"
        }

        README Content:
        ${readmeContent.slice(0, 10000)} // Limit content length
      `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up JSON string (remove markdown code blocks if present)
            const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();

            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error generating project info:', error);
            throw new Error('Failed to generate project info');
        }
    }
}
