import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ContactService {
    private prisma;
    private emailService;
    private aiService;
    private notificationsService;
    constructor(prisma: PrismaService, emailService: EmailService, aiService: AiService, notificationsService: NotificationsService);
    createContact(data: {
        name: string;
        email: string;
        phone?: string;
        company?: string;
        subject: string;
        message: string;
        category?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        status: string;
        subject: string;
        message: string;
        phone: string | null;
        company: string | null;
        category: string;
        adminResponse: string | null;
        respondedAt: Date | null;
    }>;
    getAllContacts(): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        status: string;
        subject: string;
        message: string;
        phone: string | null;
        company: string | null;
        category: string;
        adminResponse: string | null;
        respondedAt: Date | null;
    }[]>;
    getContactById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        status: string;
        subject: string;
        message: string;
        phone: string | null;
        company: string | null;
        category: string;
        adminResponse: string | null;
        respondedAt: Date | null;
    }>;
    updateContactStatus(id: string, status: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        status: string;
        subject: string;
        message: string;
        phone: string | null;
        company: string | null;
        category: string;
        adminResponse: string | null;
        respondedAt: Date | null;
    }>;
    respondToContact(id: string, response: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        status: string;
        subject: string;
        message: string;
        phone: string | null;
        company: string | null;
        category: string;
        adminResponse: string | null;
        respondedAt: Date | null;
    }>;
    generateAiResponse(id: string, language?: string, existingText?: string): Promise<{
        suggestion: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        status: string;
        subject: string;
        message: string;
        phone: string | null;
        company: string | null;
        category: string;
        adminResponse: string | null;
        respondedAt: Date | null;
    }>;
    sendCustomEmail(data: {
        to: string;
        name: string;
        subject: string;
        content: string;
        salutation?: string;
    }): Promise<import("resend").CreateEmailResponseSuccess>;
    generateAiEmail(topic: string, recipientName: string, language?: string): Promise<{
        suggestion: string;
    }>;
}
