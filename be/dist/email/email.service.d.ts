import { SettingsService } from '../settings/settings.service';
export declare class EmailService {
    private settingsService;
    private resend;
    constructor(settingsService: SettingsService);
    private initResend;
    private getNotificationTemplate;
    sendContactNotification(contact: any): Promise<import("resend").CreateEmailResponseSuccess>;
    private getResponseTemplate;
    sendContactResponse(contact: any, response: string): Promise<import("resend").CreateEmailResponseSuccess>;
    private getCustomMailTemplate;
    sendCustomMail(to: string, name: string, subject: string, content: string, salutation?: string): Promise<import("resend").CreateEmailResponseSuccess>;
    private getWelcomeTemplate;
    private getNewsletterTemplate;
    sendWelcomeEmail(to: string, unsubscribeLink: string): Promise<import("resend").CreateEmailResponseSuccess>;
    sendNewsletter(to: string, subject: string, content: string, unsubscribeLink: string): Promise<import("resend").CreateEmailResponseSuccess>;
}
