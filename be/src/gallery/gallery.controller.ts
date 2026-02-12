import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createGalleryDto: CreateGalleryDto) {
    return this.galleryService.create(createGalleryDto);
  }

  @Get()
  findAll(
    @Query('albumId') albumId?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.galleryService.findAll({
      albumId,
      tag,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('tags')
  getAllTags() {
    return this.galleryService.getAllTags();
  }

  @Get('signature')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getSignature(@Query('folder') folder?: string) {
    return this.galleryService.getUploadSignature(folder);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.galleryService.findById(id);
  }

  @Post('views/:id')
  incrementViews(@Param('id') id: string) {
    return this.galleryService.incrementViews(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      caption?: string;
      albumId?: string;
      tags?: string;
      exifData?: string;
      blurHash?: string;
      sortOrder?: number;
    },
  ) {
    return this.galleryService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }

  @Post('reorder')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  reorder(@Body() body: { items: { id: string; sortOrder: number }[] }) {
    return this.galleryService.reorder(body.items);
  }

  @Post('bulk-update')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  bulkUpdate(
    @Body()
    body: {
      ids: string[];
      data: { caption?: string; albumId?: string; tags?: string };
    },
  ) {
    return this.galleryService.bulkUpdate(body.ids, body.data);
  }
}
