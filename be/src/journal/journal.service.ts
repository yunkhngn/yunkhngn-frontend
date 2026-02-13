import { Injectable } from '@nestjs/common';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async create(createJournalDto: CreateJournalDto) {
    const { tags, ...rest } = createJournalDto;

    const journal = await this.prisma.journal.create({
      data: {
        ...rest,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return this.formatEntry(journal);
  }

  async findAll() {
    const entries = await this.prisma.journal.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((entry) => this.formatEntry(entry));
  }

  async findOne(id: string) {
    const entry = await this.prisma.journal.findUnique({
      where: { id },
    });

    if (!entry) return null;
    return this.formatEntry(entry);
  }

  async update(id: string, updateJournalDto: UpdateJournalDto) {
    const { tags, ...rest } = updateJournalDto;

    const data: any = { ...rest };
    if (tags !== undefined) {
      data.tags = tags ? JSON.stringify(tags) : null;
    }

    const entry = await this.prisma.journal.update({
      where: { id },
      data,
    });

    return this.formatEntry(entry);
  }

  async remove(id: string) {
    return this.prisma.journal.delete({
      where: { id },
    });
  }

  // Parse the JSON tags string back to an array for the frontend
  private formatEntry(entry: any) {
    return {
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : [],
    };
  }
}
