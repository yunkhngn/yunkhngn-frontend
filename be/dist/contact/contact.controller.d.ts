import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    createContact(data: CreateContactDto): Promise<{
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
    updateStatus(id: string, status: string): Promise<{
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
    generateAiSuggestion(id: string, language?: string, existingText?: string): Promise<{
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
    composeAiEmail(topic: string, recipientName: string, language?: string): Promise<{
        suggestion: string;
    }>;
}
