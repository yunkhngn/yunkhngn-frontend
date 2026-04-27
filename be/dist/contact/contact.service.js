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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const ai_service_1 = require("../ai/ai.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ContactService = class ContactService {
    constructor(prisma, emailService, aiService, notificationsService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.aiService = aiService;
        this.notificationsService = notificationsService;
    }
    async createContact(data) {
        const contact = await this.prisma.contact.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                subject: data.subject,
                message: data.message,
                category: data.category || 'general',
                status: 'new',
            },
        });
        this.emailService
            .sendContactNotification(contact)
            .catch((err) => console.error('Failed to send notification:', err));
        this.notificationsService
            .create('CONTACT', `New contact message from ${contact.name}: ${contact.subject}`, `/admin/contact`)
            .catch((err) => console.error('Failed to send real-time notification:', err));
        return contact;
    }
    async getAllContacts() {
        return this.prisma.contact.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async getContactById(id) {
        return this.prisma.contact.findUnique({
            where: { id },
        });
    }
    async updateContactStatus(id, status) {
        return this.prisma.contact.update({
            where: { id },
            data: { status },
        });
    }
    async respondToContact(id, response) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
        });
        if (!contact) {
            throw new Error('Contact not found');
        }
        await this.emailService.sendContactResponse(contact, response);
        return this.prisma.contact.update({
            where: { id },
            data: {
                adminResponse: response,
                status: 'responded',
                respondedAt: new Date(),
            },
        });
    }
    async generateAiResponse(id, language, existingText) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
        });
        if (!contact) {
            throw new Error('Contact not found');
        }
        const lang = language === 'vi' ? 'Vietnamese' : 'English';
        let prompt = '';
        if (existingText) {
            prompt = `You are a professional assistant helping to improve a response to a contact form message.

Contact Details:
- Name: ${contact.name}
- Email: ${contact.email}
${contact.company ? `- Company: ${contact.company}` : ''}
${contact.phone ? `- Phone: ${contact.phone}` : ''}
- Category: ${contact.category}

Original Message:
${contact.message}

Current Draft Response:
${existingText}

Task: Expand and improve the current draft response. Make it more professional, friendly, and thorough while keeping the same tone and intent. Address any missing points from the original message.

IMPORTANT: Respond in ${lang}. Keep the response concise but complete. Do not include a subject line.`;
        }
        else {
            prompt = `You are a professional assistant helping to respond to a contact form message.

Contact Details:
- Name: ${contact.name}
- Email: ${contact.email}
${contact.company ? `- Company: ${contact.company}` : ''}
${contact.phone ? `- Phone: ${contact.phone}` : ''}
- Category: ${contact.category}

Message:
${contact.message}

Task: Generate a professional, friendly, and helpful response. Be concise but thorough. Address their concerns directly.

IMPORTANT: Respond in ${lang}. Do not include a subject line.`;
        }
        const aiResponse = await this.aiService.generateText(prompt);
        return { suggestion: aiResponse };
    }
    async remove(id) {
        return this.prisma.contact.delete({
            where: { id },
        });
    }
    async sendCustomEmail(data) {
        const result = await this.emailService.sendCustomMail(data.to, data.name, data.subject, data.content, data.salutation);
        if (result) {
            await this.prisma.contact.create({
                data: {
                    name: data.name,
                    email: data.to,
                    subject: data.subject,
                    message: data.content,
                    category: 'sent_mail',
                    status: 'sent',
                },
            });
        }
        return result;
    }
    async generateAiEmail(topic, recipientName, language = 'en') {
        const lang = language === 'vi' ? 'Vietnamese' : 'English';
        const prompt = `You are a professional assistant helping to draft a new email.

Recipient: ${recipientName}
Topic/Purpose: ${topic}

Task: Generate a professional, friendly, and clear email body.
IMPORTANT: Respond in ${lang}. Do NOT include a subject line, just the body content.`;
        const aiResponse = await this.aiService.generateText(prompt);
        return { suggestion: aiResponse };
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        ai_service_1.AiService,
        notifications_service_1.NotificationsService])
], ContactService);
//# sourceMappingURL=contact.service.js.map