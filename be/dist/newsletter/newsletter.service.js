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
exports.NewsletterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const crypto = require("crypto");
let NewsletterService = class NewsletterService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async subscribe(email) {
        const existing = await this.prisma.subscriber.findUnique({
            where: { email },
        });
        if (existing) {
            throw new common_1.BadRequestException('Email already subscribed');
        }
        const token = crypto.randomBytes(32).toString('hex');
        const subscriber = await this.prisma.subscriber.create({
            data: {
                email,
                token,
            },
        });
        const unsubscribeLink = `${process.env.FRONTEND_URL}/newsletter/unsubscribe?token=${token}`;
        await this.emailService.sendWelcomeEmail(email, unsubscribeLink);
        return subscriber;
    }
    async unsubscribe(token) {
        const subscriber = await this.prisma.subscriber.findUnique({
            where: { token },
        });
        if (!subscriber) {
            throw new common_1.NotFoundException('Invalid unsubscribe token');
        }
        await this.prisma.subscriber.delete({
            where: { token },
        });
        return { message: 'Unsubscribed successfully' };
    }
    async sendToAll(subject, content) {
        const subscribers = await this.prisma.subscriber.findMany();
        let sentCount = 0;
        for (const sub of subscribers) {
            const unsubscribeLink = `${process.env.FRONTEND_URL}/newsletter/unsubscribe?token=${sub.token}`;
            await this.emailService.sendNewsletter(sub.email, subject, content, unsubscribeLink);
            sentCount++;
        }
        return { sent: sentCount, total: subscribers.length };
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map