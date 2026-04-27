import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
export declare class AlbumService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateSlug;
    create(dto: CreateAlbumDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
        coverPhotoId: string | null;
    }>;
    findAll(): Promise<{
        photoCount: number;
        _count: any;
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
        coverPhotoId: string | null;
    }[]>;
    findBySlug(slug: string): Promise<{
        photos: {
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
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
        coverPhotoId: string | null;
    }>;
    update(id: string, dto: UpdateAlbumDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
        coverPhotoId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        updatedAt: Date;
        description: string | null;
        sortOrder: number;
        coverPhotoId: string | null;
    }>;
}
