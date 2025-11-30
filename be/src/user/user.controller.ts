import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(AuthGuard('firebase'))
    @Get('me')
    async getProfile(@Request() req) {
        const uid = req.user.uid;
        const user = await this.userService.findByUid(uid);
        if (!user) {
            // If user doesn't exist in DB but exists in Firebase, we might want to create it?
            // Or just return null/404.
            // For now, let's return null or basic info from token.
            return { uid, email: req.user.email };
        }
        return user;
    }
}
