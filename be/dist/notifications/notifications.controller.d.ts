import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(page: string, limit: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: string;
            link: string | null;
            message: string;
            read: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
            unreadCount: number;
        };
    }>;
    markAllAsRead(): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        link: string | null;
        message: string;
        read: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        link: string | null;
        message: string;
        read: boolean;
    }>;
}
