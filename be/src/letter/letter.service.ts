import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { Prisma } from '@prisma/client';

type LetterWithPages = Prisma.LetterGetPayload<{
  include: { pages: true };
}>;

@Injectable()
export class LetterService {
  constructor(private prisma: PrismaService) { }

  private stripSensitive(letter: LetterWithPages) {
    const { password, ...rest } = letter;
    return { ...rest, hasPassword: !!password };
  }

  private generateCode(length = 8): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async create(dto: CreateLetterDto) {
    let code = dto.code;
    if (!code) {
      let attempts = 0;
      do {
        code = this.generateCode();
        const existing = await this.prisma.letter.findUnique({
          where: { code },
        });
        if (!existing) break;
        attempts++;
      } while (attempts < 10);
      if (attempts >= 10)
        throw new ConflictException('Failed to generate unique code.');
    } else {
      const existing = await this.prisma.letter.findUnique({
        where: { code },
      });
      if (existing) throw new ConflictException('This code is already in use');
    }

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : null;

    const letter = await this.prisma.letter.create({
      data: {
        code,
        title: dto.title,
        password: hashedPassword,
        status: dto.enableAnimation === false ? 'ready' : 'processing',
        isActive: dto.isActive ?? true,
        enableAnimation: dto.enableAnimation ?? true,
        pages: {
          create: dto.pages.map((p, i) => ({
            imageUrl: p.imageUrl,
            width: p.width,
            height: p.height,
            sortOrder: p.sortOrder ?? i,
          })),
        },
      },
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });

    if (letter.enableAnimation) {
      this.triggerProcessing(letter.id, letter.pages).catch((err) =>
        console.error('Letter processing trigger failed:', err),
      );
    }

    return this.stripSensitive(letter);
  }

  private async triggerProcessing(
    letterId: string,
    pages: { id: string; imageUrl: string }[],
  ) {
    const aiUrl = process.env.LETTER_AI_URL || 'http://localhost:8000';
    const selfUrl = process.env.SELF_URL || 'http://localhost:3001';
    try {
      await axios.post(`${aiUrl}/process`, {
        letterId,
        pages: pages.map((p) => ({ id: p.id, imageUrl: p.imageUrl })),
        callbackUrl: `${selfUrl}/letters/processing-callback`,
      });
    } catch (err) {
      console.error('Letter AI request failed:', err);
      await this.prisma.letter.update({
        where: { id: letterId },
        data: { status: 'failed' },
      });
    }
  }

  async handleProcessingCallback(data: {
    letterId: string;
    pages: { id: string; revealMapUrl: string }[];
    success: boolean;
  }) {
    if (!data.success) {
      await this.prisma.letter.update({
        where: { id: data.letterId },
        data: { status: 'failed' },
      });
      return { ok: true };
    }
    for (const page of data.pages) {
      await this.prisma.letterPage.update({
        where: { id: page.id },
        data: { revealMapUrl: page.revealMapUrl },
      });
    }
    await this.prisma.letter.update({
      where: { id: data.letterId },
      data: { status: 'ready' },
    });
    return { ok: true };
  }

  async findAll() {
    const letters = await this.prisma.letter.findMany({
      orderBy: { createdAt: 'desc' },
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });
    return letters.map((l) => this.stripSensitive(l));
  }

  async resolve(code: string) {
    const letter = await this.prisma.letter.findUnique({
      where: { code },
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!letter) throw new NotFoundException('Letter not found');
    if (!letter.isActive)
      throw new NotFoundException('This letter is no longer available');
    if (letter.status === 'processing')
      throw new NotFoundException('Letter is still being processed');
    if (letter.status === 'failed')
      throw new NotFoundException('Letter processing failed');

    this.prisma.letter
      .update({
        where: { id: letter.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => { });

    return {
      id: letter.id,
      title: letter.title,
      hasPassword: !!letter.password,
      enableAnimation: letter.enableAnimation,
      pages: letter.password ? [] : letter.pages,
      createdAt: letter.createdAt,
    };
  }

  async verifyPassword(code: string, password: string) {
    const letter = await this.prisma.letter.findUnique({
      where: { code },
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!letter) throw new NotFoundException('Letter not found');
    if (!letter.isActive)
      throw new NotFoundException('This letter is no longer available');
    if (letter.status === 'processing')
      throw new NotFoundException('Letter is still being processed');
    if (letter.status === 'failed')
      throw new NotFoundException('Letter processing failed');
    if (!letter.password) return { pages: letter.pages, title: letter.title };

    const isValid = await bcrypt.compare(password, letter.password);
    if (!isValid) throw new ForbiddenException('Incorrect password');
    return { pages: letter.pages, title: letter.title };
  }

  async update(id: string, dto: UpdateLetterDto) {
    const existing = await this.prisma.letter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Letter not found');

    if (dto.code && dto.code !== existing.code) {
      const codeInUse = await this.prisma.letter.findUnique({
        where: { code: dto.code },
      });
      if (codeInUse) throw new ConflictException('This code is already in use');
    }

    const data: Record<string, unknown> = {};
    if (dto.code) data.code = dto.code;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.removePassword) {
      data.password = null;
    } else if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.enableAnimation !== undefined) data.enableAnimation = dto.enableAnimation;
    const isAnimEnabled = dto.enableAnimation ?? existing.enableAnimation;

    let shouldReprocess = false;

    // If pages change, process if animation is enabled
    if (dto.pages) {
      await this.prisma.letterPage.deleteMany({ where: { letterId: id } });
      data.pages = {
        create: dto.pages.map((p, i) => ({
          imageUrl: p.imageUrl,
          width: p.width,
          height: p.height,
          sortOrder: p.sortOrder ?? i,
        })),
      };
      if (isAnimEnabled) {
        shouldReprocess = true;
        data.status = 'processing';
      } else {
        data.status = 'ready';
      }
    } else if (dto.enableAnimation === true && !existing.enableAnimation) {
      // If no new pages were uploaded but animation was just enabled, we need to process existing pages
      shouldReprocess = true;
      data.status = 'processing';
    } else if (dto.enableAnimation === false) {
      data.status = 'ready';
    }

    const letter = await this.prisma.letter.update({
      where: { id },
      data,
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });

    if (shouldReprocess) {
      this.triggerProcessing(letter.id, letter.pages).catch((err) =>
        console.error('Letter processing trigger failed:', err),
      );
    }

    return this.stripSensitive(letter);
  }

  async remove(id: string) {
    const existing = await this.prisma.letter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Letter not found');
    return this.prisma.letter.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.letter.deleteMany({
      where: { id: { in: ids } },
    });
    return { deleted: result.count };
  }

  async bulkUpdateStatus(ids: string[], isActive: boolean) {
    const result = await this.prisma.letter.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
    return { updated: result.count };
  }
}
