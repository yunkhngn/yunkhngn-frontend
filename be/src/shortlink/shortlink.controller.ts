import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ShortlinkService } from './shortlink.service';
import { CreateShortlinkDto } from './dto/create-shortlink.dto';
import { UpdateShortlinkDto } from './dto/update-shortlink.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('shortlinks')
export class ShortlinkController {
    constructor(private readonly shortlinkService: ShortlinkService) { }

    @Post()
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() dto: CreateShortlinkDto) {
        return this.shortlinkService.create(dto);
    }

    @Get()
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAll() {
        return this.shortlinkService.findAll();
    }

    @Get('resolve/:code')
    resolve(@Param('code') code: string) {
        return this.shortlinkService.resolve(code);
    }

    @Patch(':id')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateShortlinkDto) {
        return this.shortlinkService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.shortlinkService.remove(id);
    }
}
