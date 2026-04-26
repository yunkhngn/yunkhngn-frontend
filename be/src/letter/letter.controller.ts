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
import { LetterService } from './letter.service';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('letters')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateLetterDto) {
    return this.letterService.create(dto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.letterService.findAll();
  }

  @Get('resolve/:code')
  resolve(@Param('code') code: string) {
    return this.letterService.resolve(code);
  }

  @Post('verify/:code')
  verifyPassword(
    @Param('code') code: string,
    @Body() body: { password: string },
  ) {
    return this.letterService.verifyPassword(code, body.password);
  }

  @Post('processing-callback')
  processingCallback(
    @Body()
    body: {
      letterId: string;
      pages: { id: string; revealMapUrl: string }[];
      success: boolean;
    },
  ) {
    return this.letterService.handleProcessingCallback(body);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateLetterDto) {
    return this.letterService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.letterService.remove(id);
  }

  @Post('bulk/delete')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  bulkDelete(@Body() body: { ids: string[] }) {
    return this.letterService.bulkDelete(body.ids);
  }

  @Post('bulk/status')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  bulkUpdateStatus(@Body() body: { ids: string[]; isActive: boolean }) {
    return this.letterService.bulkUpdateStatus(body.ids, body.isActive);
  }
}
