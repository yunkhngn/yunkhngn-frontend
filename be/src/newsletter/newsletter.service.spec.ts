import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterService } from './newsletter.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('NewsletterService', () => {
  let service: NewsletterService;

  const mockPrismaService = {
    subscriber: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockEmailService = {
    sendWelcomeEmail: jest.fn(),
    sendNewsletter: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
