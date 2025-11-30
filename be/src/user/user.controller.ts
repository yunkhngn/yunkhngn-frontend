import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
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
            return { uid, email: req.user.email };
        }
        return user;
    }

    @UseGuards(AuthGuard('firebase'))
    @Patch('me')
    async updateProfile(@Request() req, @Body() body: { name?: string; avatarUrl?: string }) {
        const uid = req.user.uid;
        const email = req.user.email;
        return this.userService.createOrUpdate(uid, email, body.avatarUrl, body.name);
    }
}
