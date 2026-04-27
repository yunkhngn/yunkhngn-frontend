import { CreateGalleryDto } from './dto/create-gallery.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class GalleryService {
    private prisma;
    private cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    create(createGalleryDto: CreateGalleryDto): Promise<{
        id: string;
        createdAt: Date;
        tags: string | null;
        views: number;
        imageUrl: string;
        caption: string | null;
        albumId: string | null;
        exifData: string | null;
        blurHash: string | null;
        sortOrder: number;
        width: number | null;
        height: number | null;
    }>;
    findAll(query?: {
        albumId?: string;
        tag?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            album: {
                id: string;
                name: string;
                slug: string;
            };
            id: string;
            createdAt: Date;
            tags: string;
            views: number;
            imageUrl: string;
            caption: string;
            albumId: string;
            blurHash: string;
            sortOrder: number;
            width: number;
            height: number;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<{
        album: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        id: string;
        createdAt: Date;
        tags: string | null;
        views: number;
        imageUrl: string;
        caption: string | null;
        albumId: string | null;
        exifData: string | null;
        blurHash: string | null;
        sortOrder: number;
        width: number | null;
        height: number | null;
    }>;
    incrementViews(id: string): {
        success: boolean;
    };
    update(id: string, data: {
        caption?: string;
        albumId?: string;
        tags?: string;
        exifData?: string;
        blurHash?: string;
        sortOrder?: number;
        width?: number;
        height?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        tags: string | null;
        views: number;
        imageUrl: string;
        caption: string | null;
        albumId: string | null;
        exifData: string | null;
        blurHash: string | null;
        sortOrder: number;
        width: number | null;
        height: number | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        tags: string | null;
        views: number;
        imageUrl: string;
        caption: string | null;
        albumId: string | null;
        exifData: string | null;
        blurHash: string | null;
        sortOrder: number;
        width: number | null;
        height: number | null;
    }>;
    reorder(items: {
        id: string;
        sortOrder: number;
    }[]): Promise<{
        updated: number;
    }>;
    bulkUpdate(ids: string[], data: {
        caption?: string;
        albumId?: string;
        tags?: string;
    }): Promise<{
        updated: number;
    }>;
    getAllTags(): Promise<string[]>;
    getUploadSignature(folder?: string): {
        signature: string;
        timestamp: number;
        cloudName: string;
        apiKey: string;
    };
}
