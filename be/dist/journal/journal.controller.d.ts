import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
export declare class JournalController {
    private readonly journalService;
    constructor(journalService: JournalService);
    create(createJournalDto: CreateJournalDto): Promise<any>;
    findAll(page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateJournalDto: UpdateJournalDto): Promise<any>;
    toggleReaction(id: string, type: string, user: any): Promise<{
        action: string;
        type: string;
    }>;
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
}
