import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private prisma;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsGateway: NotificationsGateway);
    create(type: string, message: string, link?: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        link: string | null;
        message: string;
        read: boolean;
    }>;
    findAll(page?: number, limit?: number): Promise<{
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
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        link: string | null;
        message: string;
        read: boolean;
    }>;
    markAllAsRead(): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        link: string | null;
        message: string;
        read: boolean;
    }>;
}
