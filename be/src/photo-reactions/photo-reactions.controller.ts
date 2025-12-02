import { Controller, Post, Delete, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PhotoReactionsService } from './photo-reactions.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('photo-reactions')
export class PhotoReactionsController {
    constructor(private readonly photoReactionsService: PhotoReactionsService) { }

    @Post(':photoId')
    @UseGuards(FirebaseAuthGuard)
    async addReaction(
        @Param('photoId') photoId: string,
        @Body('reactionType') reactionType: string,
        @Req() req: any,
    ) {
        const uid = req.user.uid;

        // Validate reaction type
        const validTypes = ['like', 'heart', 'cat', 'fire', 'laugh'];
        if (!validTypes.includes(reactionType)) {
            throw new Error('Invalid reaction type');
        }

        const reaction = await this.photoReactionsService.addOrUpdateReaction(photoId, uid, reactionType);
        const stats = await this.photoReactionsService.getPhotoReactions(photoId);

        return {
            reaction,
            stats,
        };
    }

    @Delete(':photoId')
    @UseGuards(FirebaseAuthGuard)
    async removeReaction(
        @Param('photoId') photoId: string,
        @Req() req: any,
    ) {
        const uid = req.user.uid;
        await this.photoReactionsService.removeReaction(photoId, uid);
        const stats = await this.photoReactionsService.getPhotoReactions(photoId);

        return { stats };
    }

    @Get(':photoId')
    async getReactions(
        @Param('photoId') photoId: string,
        @Req() req: any,
    ) {
        const stats = await this.photoReactionsService.getPhotoReactions(photoId);

        // Get user's reaction if authenticated
        let userReaction = null;
        if (req.user?.uid) {
            userReaction = await this.photoReactionsService.getUserReaction(photoId, req.user.uid);
        }

        return {
            stats,
            userReaction: userReaction?.reactionType || null,
        };
    }
}
