import { PrismaService } from '../prisma/prisma.service';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findByUid(uid: string): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }[]>;
    create(email: string, password?: string, name?: string, role?: string): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    update(uid: string, data: {
        name?: string;
        role?: string;
        password?: string;
    }): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    delete(uid: string): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    createOrUpdate(uid: string, email: string, avatarUrl?: string, name?: string): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
}
