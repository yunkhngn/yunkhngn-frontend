import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findByUid(uid: string) {
        return this.prisma.user.findUnique({
            where: { uid },
        });
    }

    async findAll() {
        return this.prisma.user.findMany();
    }

    async create(email: string, password?: string, name?: string, role: string = 'ADMIN') {
        // 1. Create in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        // 2. Create in DB
        return this.prisma.user.create({
            data: {
                uid: userRecord.uid,
                email,
                name,
                role,
            },
        });
    }

    async update(uid: string, data: { name?: string; role?: string; password?: string }) {
        // 1. Update Firebase Auth (if password or name changed)
        if (data.password || data.name) {
            await admin.auth().updateUser(uid, {
                password: data.password,
                displayName: data.name,
            });
        }

        // 2. Update DB
        return this.prisma.user.update({
            where: { uid },
            data: {
                name: data.name,
                role: data.role,
            },
        });
    }

    async delete(uid: string) {
        // 1. Delete from Firebase Auth
        await admin.auth().deleteUser(uid);

        // 2. Delete from DB
        return this.prisma.user.delete({
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
