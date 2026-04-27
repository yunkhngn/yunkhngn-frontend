import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
export declare class NewsletterService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    subscribe(email: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        token: string | null;
    }>;
    unsubscribe(token: string): Promise<{
        message: string;
    }>;
    sendToAll(subject: string, content: string): Promise<{
        sent: number;
        total: number;
    }>;
}
