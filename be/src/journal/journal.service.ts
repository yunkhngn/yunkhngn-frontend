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
        images: rest.images ? JSON.stringify(rest.images) : null,
      },
    });

    return this.formatEntry(journal);
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.journal.findMany({
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reactions: true,
          replies: {
            orderBy: { createdAt: 'asc' },
            include: { reactions: true },
          },
        },
      }),
      this.prisma.journal.count({ where: { parentId: null } }),
    ]);

    return {
      data: entries.map((entry) => this.formatEntry(entry)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const entry = await this.prisma.journal.findUnique({
      where: { id },
      include: {
        reactions: true,
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { reactions: true },
        },
      },
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
    if (rest.images !== undefined) {
      data.images = rest.images ? JSON.stringify(rest.images) : null;
    }

    const entry = await this.prisma.journal.update({
      where: { id },
      data,
      include: { reactions: true, replies: { include: { reactions: true } } },
    });

    return this.formatEntry(entry);
  }

  async remove(id: string) {
    // Replies are set to NoAction, so we should delete them manually or change schema
    // But since they are self-referencing and we want cascade delete logic usually...
    // Actually, let's just delete the entry. If schema says NoAction, SQL might error if children exist.
    // Let's delete children first if any.
    const children = await this.prisma.journal.findMany({
      where: { parentId: id },
    });
    for (const child of children) {
      await this.remove(child.id); // Recursive delete
    }

    return this.prisma.journal.delete({
      where: { id },
    });
  }

  async toggleReaction(journalId: string, uid: string, type: string) {
    const existing = await this.prisma.journalReaction.findUnique({
      where: {
        journalId_uid: { journalId, uid },
      },
    });

    if (existing) {
      if (existing.type === type) {
        // Remove reaction
        await this.prisma.journalReaction.delete({
          where: { id: existing.id },
        });
        return { action: 'removed', type };
      } else {
        // Update reaction
        await this.prisma.journalReaction.update({
          where: { id: existing.id },
          data: { type },
        });
        return { action: 'updated', type };
      }
    } else {
      // Create reaction
      await this.prisma.journalReaction.create({
        data: { journalId, uid, type },
      });
      return { action: 'created', type };
    }
  }

  // Parse the JSON tags string back to an array for the frontend
  private formatEntry(entry: any) {
    const formatted = {
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : [],
      images: entry.images ? JSON.parse(entry.images) : [],
    };

    if (entry.replies) {
      formatted.replies = entry.replies.map((r) => this.formatEntry(r));
    }

    return formatted;
  }
}
