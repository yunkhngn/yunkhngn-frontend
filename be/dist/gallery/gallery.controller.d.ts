import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
export declare class GalleryController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
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
    findAll(albumId?: string, tag?: string, page?: string, limit?: string): Promise<{
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
    getAllTags(): Promise<string[]>;
    getSignature(folder?: string): {
        signature: string;
        timestamp: number;
        cloudName: string;
        apiKey: string;
    };
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
    update(id: string, body: {
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
    reorder(body: {
        items: {
            id: string;
            sortOrder: number;
        }[];
    }): Promise<{
        updated: number;
    }>;
    bulkUpdate(body: {
        ids: string[];
        data: {
            caption?: string;
            albumId?: string;
            tags?: string;
        };
    }): Promise<{
        updated: number;
    }>;
}
