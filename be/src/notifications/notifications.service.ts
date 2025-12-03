import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    async create(type: string, message: string, link?: string) {
        const notification = await this.prisma.notification.create({
            data: {
                type,
                message,
                link,
            },
        });

        this.notificationsGateway.sendNotification(notification);
        return notification;
    }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count(),
        ]);

        const unreadCount = await this.prisma.notification.count({
            where: { read: false },
        });

        return {
            data: notifications,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }

    async markAllAsRead() {
        return this.prisma.notification.updateMany({
            where: { read: false },
            data: { read: true },
        });
    }

    async remove(id: string) {
        return this.prisma.notification.delete({
            where: { id },
        });
    }
}
