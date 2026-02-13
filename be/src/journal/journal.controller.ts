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
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('journals')
export class JournalController {
    constructor(private readonly journalService: JournalService) { }

    @Post()
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() createJournalDto: CreateJournalDto) {
        return this.journalService.create(createJournalDto);
    }

    @Get()
    findAll() {
        return this.journalService.findAll();
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

    @Delete(':id')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.journalService.remove(id);
    }
}
