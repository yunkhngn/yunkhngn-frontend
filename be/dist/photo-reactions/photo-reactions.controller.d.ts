import { PhotoReactionsService } from './photo-reactions.service';
interface RequestWithUser extends Request {
    user?: {
        uid: string;
    };
}
import { CreateReactionDto } from './dto/create-reaction.dto';
export declare class PhotoReactionsController {
    private readonly photoReactionsService;
    constructor(photoReactionsService: PhotoReactionsService);
    addReaction(photoId: string, data: CreateReactionDto, req: RequestWithUser): Promise<{
        reaction: {
            id: string;
            uid: string;
            createdAt: Date;
            photoId: string;
            reactionType: string;
        };
        stats: {
            counts: Record<string, number>;
            total: number;
        };
    }>;
    removeReaction(photoId: string, req: RequestWithUser): Promise<{
        stats: {
            counts: Record<string, number>;
            total: number;
        };
    }>;
    getReactions(photoId: string, req: RequestWithUser): Promise<{
        stats: {
            counts: Record<string, number>;
            total: number;
        };
        userReaction: string;
    }>;
}
export {};
