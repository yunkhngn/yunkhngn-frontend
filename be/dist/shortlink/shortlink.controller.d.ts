import { ShortlinkService } from './shortlink.service';
import { CreateShortlinkDto } from './dto/create-shortlink.dto';
import { UpdateShortlinkDto } from './dto/update-shortlink.dto';
export declare class ShortlinkController {
    private readonly shortlinkService;
    constructor(shortlinkService: ShortlinkService);
    create(dto: CreateShortlinkDto): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        updatedAt: Date;
        code: string;
        targetUrl: string;
        isActive: boolean;
        expiresAt: Date | null;
        clicks: number;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        updatedAt: Date;
        code: string;
        targetUrl: string;
        isActive: boolean;
        expiresAt: Date | null;
        clicks: number;
    }[]>;
    resolve(code: string): Promise<{
        targetUrl: string;
    }>;
    update(id: string, dto: UpdateShortlinkDto): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        updatedAt: Date;
        code: string;
        targetUrl: string;
        isActive: boolean;
        expiresAt: Date | null;
        clicks: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        updatedAt: Date;
        code: string;
        targetUrl: string;
        isActive: boolean;
        expiresAt: Date | null;
        clicks: number;
    }>;
    bulkDelete(body: {
        ids: string[];
    }): Promise<{
        deleted: number;
    }>;
    bulkUpdateStatus(body: {
        ids: string[];
        isActive: boolean;
    }): Promise<{
        updated: number;
    }>;
}
