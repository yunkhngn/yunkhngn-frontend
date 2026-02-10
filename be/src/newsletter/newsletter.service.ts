import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class NewsletterService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    async subscribe(email: string) {
        const existing = await this.prisma.subscriber.findUnique({
            where: { email },
        });

        if (existing) {
            throw new BadRequestException('Email already subscribed');
        }

        const token = crypto.randomBytes(32).toString('hex');

        const subscriber = await this.prisma.subscriber.create({
            data: {
                email,
                token,
            },
        });

        // Send welcome email
        const unsubscribeLink = `${process.env.FRONTEND_URL}/newsletter/unsubscribe?token=${token}`;
        await this.emailService.sendWelcomeEmail(email, unsubscribeLink);

        return subscriber;
    }

    async unsubscribe(token: string) {
        const subscriber = await this.prisma.subscriber.findUnique({
            where: { token },
        });

        if (!subscriber) {
            throw new NotFoundException('Invalid unsubscribe token');
        }

        await this.prisma.subscriber.delete({
            where: { token },
        });

        return { message: 'Unsubscribed successfully' };
    }

    async sendToAll(subject: string, content: string) {
        const subscribers = await this.prisma.subscriber.findMany();
        let sentCount = 0;

        for (const sub of subscribers) {
            const unsubscribeLink = `${process.env.FRONTEND_URL}/newsletter/unsubscribe?token=${sub.token}`;
            await this.emailService.sendNewsletter(
                sub.email,
                subject,
                content,
                unsubscribeLink,
            );
            sentCount++;
        }

        return { sent: sentCount, total: subscribers.length };
    }
}
