import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    UseGuards,
    Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@Query('page') page: string, @Query('limit') limit: string) {
        return this.notificationsService.findAll(+page || 1, +limit || 20);
    }

    @Patch('read-all')
    markAllAsRead() {
        return this.notificationsService.markAllAsRead();
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.notificationsService.remove(id);
    }
}
