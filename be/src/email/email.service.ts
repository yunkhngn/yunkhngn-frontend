import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    private getNotificationTemplate(data: any): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #000000; color: #e5e5e5; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="margin-bottom: 40px; border-bottom: 1px solid #333; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">New Contact Message</h1>
            <div style="margin-top: 8px; font-size: 13px; color: #888;">Received via yunkhngn.com</div>
        </div>

        <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px;">
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; padding-top: 4px;">From</div>
                <div>
                    <div style="font-size: 16px; font-weight: 500; color: #fff;">${data.name}</div>
                    <div style="font-size: 14px; color: #888; margin-top: 2px;">${data.email}</div>
                </div>
            </div>

            ${data.phone ? `
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; padding-top: 4px;">Phone</div>
                <div style="font-size: 15px; color: #ccc;">${data.phone}</div>
            </div>` : ''}

            ${data.company ? `
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; padding-top: 4px;">Company</div>
                <div style="font-size: 15px; color: #ccc;">${data.company}</div>
            </div>` : ''}

            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; padding-top: 4px;">Category</div>
                <div><span style="display: inline-block; padding: 4px 10px; background: #222; border: 1px solid #333; border-radius: 4px; font-size: 12px; color: #ccc;">${data.category}</span></div>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #222;">
                <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Message</div>
                <div style="font-size: 16px; line-height: 1.6; color: #e5e5e5; white-space: pre-wrap;">${data.message}</div>
            </div>
        </div>

        <div style="margin-top: 32px; text-align: center;">
            <a href="${data.adminUrl}" style="display: inline-block; padding: 12px 24px; background: #fff; color: #000; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; transition: opacity 0.2s;">Reply in Dashboard</a>
        </div>
    </div>
</body>
</html>`;
    }

    private getResponseTemplate(data: any): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Response</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #000000; color: #e5e5e5; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Minimal Header -->
        <div style="margin-bottom: 40px;">
            <div style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">yunkhngn.</div>
        </div>

        <!-- Main Content -->
        <div style="font-size: 16px; line-height: 1.6; color: #d4d4d4;">
            <p style="margin-bottom: 24px;">Hi ${data.name},</p>
            
            <div style="color: #ffffff; margin-bottom: 32px;">
                ${data.response}
            </div>

            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #222;">
                <p style="margin: 0; color: #fff; font-weight: 500;">Khoa Nguyen</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #666;">Software Engineer & Designer</p>
                <div style="margin-top: 16px;">
                    <a href="https://yunkhngn.com" style="color: #666; text-decoration: none; font-size: 13px; margin-right: 16px;">Website</a>
                    <a href="https://github.com/yunkhngn" style="color: #666; text-decoration: none; font-size: 13px; margin-right: 16px;">GitHub</a>
                    <a href="https://linkedin.com/in/yunkhngn" style="color: #666; text-decoration: none; font-size: 13px;">LinkedIn</a>
                </div>
            </div>
        </div>

        <!-- Original Message Context (Subtle) -->
        <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #1a1a1a;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #444; margin-bottom: 12px;">Original Message</div>
            <div style="font-size: 13px; line-height: 1.5; color: #555; background: #0a0a0a; padding: 16px; border-radius: 8px; border: 1px solid #1a1a1a;">
                ${data.originalMessage}
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    async sendContactNotification(contact: any) {
        try {
            const html = this.getNotificationTemplate({
                name: contact.name,
                email: contact.email,
                phone: contact.phone || '',
                company: contact.company || '',
                subject: contact.subject,
                message: contact.message.replace(/\n/g, '<br>'),
                category: contact.category?.toUpperCase() || 'GENERAL',
                timestamp: new Date(contact.createdAt).toLocaleString(),
                adminUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/contact`,
            });

            const { data, error } = await this.resend.emails.send({
                from: `Portfolio Contact <noreply@${process.env.RESEND_DOMAIN}>`,
                to: process.env.ADMIN_EMAIL || 'admin@example.com',
                subject: `New Contact: ${contact.subject}`,
                html,
            });

            if (error) {
                console.error('Failed to send notification email:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error sending notification email:', error);
            return null;
        }
    }

    async sendContactResponse(contact: any, response: string) {
        try {
            const html = this.getResponseTemplate({
                name: contact.name,
                subject: contact.subject,
                response: response.replace(/\n/g, '<br>'),
                originalMessage: contact.message.replace(/\n/g, '<br>'),
            });

            const { data, error } = await this.resend.emails.send({
                from: `Khoa Nguyen <noreply@${process.env.RESEND_DOMAIN}>`,
                to: contact.email,
                replyTo: process.env.ADMIN_EMAIL || 'admin@example.com',
                subject: `Re: ${contact.subject}`,
                html,
            });

            if (error) {
                console.error('Failed to send response email:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error sending response email:', error);
            return null;
        }
    }
}
