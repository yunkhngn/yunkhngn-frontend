import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class JournalService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createJournalDto: CreateJournalDto): Promise<any>;
    findAll(page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateJournalDto: UpdateJournalDto): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        tags: string | null;
        updatedAt: Date;
        images: string | null;
        mood: string;
        parentId: string | null;
    }>;
    toggleReaction(journalId: string, uid: string, type: string): Promise<{
        action: string;
        type: string;
    }>;
    private formatEntry;
}
