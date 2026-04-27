import { NewsletterService } from './newsletter.service';
export declare class NewsletterController {
    private readonly newsletterService;
    constructor(newsletterService: NewsletterService);
    subscribe(email: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        token: string | null;
    }>;
    unsubscribe(token: string): Promise<{
        message: string;
    }>;
    send(body: {
        subject: string;
        content: string;
    }): Promise<{
        sent: number;
        total: number;
    }>;
}
