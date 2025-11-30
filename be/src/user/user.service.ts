import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findByUid(uid: string) {
        return this.prisma.user.findUnique({
            where: { uid },
        });
    }

    async createOrUpdate(uid: string, email: string, avatarUrl?: string, name?: string) {
        return this.prisma.user.upsert({
            where: { uid },
            update: {
                email,
                avatarUrl,
                name,
            },
            create: {
                uid,
                email,
                avatarUrl,
                name,
                role: 'ADMIN', // Default role, maybe change later
            },
        });
    }
}
