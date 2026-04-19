import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../auth/user.decorator';

@Controller('journals')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalService.create(createJournalDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.journalService.findAll(
      page ? parseInt(page, 10) || 1 : 1,
      limit ? parseInt(limit, 10) || 20 : 20,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateJournalDto: UpdateJournalDto) {
    return this.journalService.update(id, updateJournalDto);
  }

  @Post(':id/reactions')
  @UseGuards(FirebaseAuthGuard)
  toggleReaction(
    @Param('id') id: string,
    @Body('type') type: string,
    @User() user,
  ) {
    if (!user) throw new Error('User not found in request');
    return this.journalService.toggleReaction(id, user.uid, type);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.journalService.remove(id);
  }
}
