import { UserService } from './user.service';
interface RequestWithUser extends Request {
    user: {
        uid: string;
        email: string;
    };
}
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: RequestWithUser): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    } | {
        uid: string;
        email: string;
    }>;
    updateProfile(req: RequestWithUser, body: {
        name?: string;
        avatarUrl?: string;
    }): Promise<{
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
    create(body: {
        email: string;
        password?: string;
        name?: string;
        role?: string;
    }): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    update(uid: string, body: {
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
    remove(uid: string): Promise<{
        id: string;
        uid: string;
        email: string;
        name: string | null;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
}
export {};
