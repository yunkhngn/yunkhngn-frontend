import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AiService } from '../ai/ai.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private aiService: AiService,
    private notificationsService: NotificationsService,
  ) { }

  async createContact(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
    category?: string;
  }) {
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

    // Send notification email to admin (non-blocking)
    this.emailService
      .sendContactNotification(contact)
      .catch((err) => console.error('Failed to send notification:', err));

    // Send real-time notification
    this.notificationsService
      .create(
        'CONTACT',
        `New contact message from ${contact.name}: ${contact.subject}`,
        `/admin/contact`,
      )
      .catch((err) =>
        console.error('Failed to send real-time notification:', err),
      );

    return contact;
  }

  async getAllContacts() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContactById(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }

  async updateContactStatus(id: string, status: string) {
    return this.prisma.contact.update({
      where: { id },
      data: { status },
    });
  }

  async respondToContact(id: string, response: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Send response email to customer
    await this.emailService.sendContactResponse(contact, response);

    // Update contact with response
    return this.prisma.contact.update({
      where: { id },
      data: {
        adminResponse: response,
        status: 'responded',
        respondedAt: new Date(),
      },
    });
  }

  async generateAiResponse(
    id: string,
    language?: string,
    existingText?: string,
  ) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    const lang = language === 'vi' ? 'Vietnamese' : 'English';

    let prompt = '';

    if (existingText) {
      // Expand/improve existing text
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
    } else {
      // Generate new response
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

  async remove(id: string) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }

  async sendCustomEmail(data: {
    to: string;
    name: string;
    subject: string;
    content: string;
  }) {
    return this.emailService.sendCustomMail(
      data.to,
      data.name,
      data.subject,
      data.content,
    );
  }

  async generateAiEmail(
    topic: string,
    recipientName: string,
    language: string = 'en',
  ) {
    const lang = language === 'vi' ? 'Vietnamese' : 'English';
    const prompt = `You are a professional assistant helping to draft a new email.

Recipient: ${recipientName}
Topic/Purpose: ${topic}

Task: Generate a professional, friendly, and clear email body.
IMPORTANT: Respond in ${lang}. Do NOT include a subject line, just the body content.`;

    const aiResponse = await this.aiService.generateText(prompt);
    return { suggestion: aiResponse };
  }
}
