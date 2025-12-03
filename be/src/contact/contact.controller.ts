import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  async createContact(
    @Body()
    data: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      subject: string;
      message: string;
      category?: string;
    },
  ) {
    return this.contactService.createContact(data);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getAllContacts() {
    return this.contactService.getAllContacts();
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getContactById(@Param('id') id: string) {
    return this.contactService.getContactById(id);
  }

  @Patch(':id/status')
  @UseGuards(FirebaseAuthGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.contactService.updateContactStatus(id, status);
  }

  @Post(':id/respond')
  @UseGuards(FirebaseAuthGuard)
  async respondToContact(
    @Param('id') id: string,
    @Body('response') response: string,
  ) {
    return this.contactService.respondToContact(id, response);
  }

  @Post(':id/ai-suggest')
  @UseGuards(FirebaseAuthGuard)
  async generateAiSuggestion(
    @Param('id') id: string,
    @Body('language') language?: string,
    @Body('existingText') existingText?: string,
  ) {
    return this.contactService.generateAiResponse(id, language, existingText);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
