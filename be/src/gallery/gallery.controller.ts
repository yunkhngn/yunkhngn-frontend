import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('gallery')
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) { }

    @Post()
    @UseGuards(FirebaseAuthGuard)
    create(@Body() createGalleryDto: CreateGalleryDto) {
        return this.galleryService.create(createGalleryDto);
    }

    @Get()
    findAll() {
        return this.galleryService.findAll();
    }

    @Get('signature')
    @UseGuards(FirebaseAuthGuard)
    getSignature(@Query('folder') folder?: string) {
        return this.galleryService.getUploadSignature(folder);
    }

    @Patch(':id')
    @UseGuards(FirebaseAuthGuard)
    update(@Param('id') id: string, @Body() body: { caption?: string }) {
        return this.galleryService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(FirebaseAuthGuard)
    remove(@Param('id') id: string) {
        return this.galleryService.remove(id);
    }
}
