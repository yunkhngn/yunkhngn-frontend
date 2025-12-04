import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: PrismaService;
  let emailService: EmailService;
  let aiService: AiService;

  const mockPrismaService = {
    contact: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEmailService = {
    sendContactNotification: jest.fn().mockResolvedValue(true),
    sendContactResponse: jest.fn().mockResolvedValue(true),
  };

  const mockAiService = {
    generateText: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: AiService, useValue: mockAiService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    aiService = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContact', () => {
    it('should create a contact and send notification', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Hello',
      };

      const expectedContact = {
        id: '1',
        ...dto,
        status: 'new',
        category: 'general',
      };
      mockPrismaService.contact.create.mockResolvedValue(expectedContact);

      const result = await service.createContact(dto);

      expect(prisma.contact.create).toHaveBeenCalledWith({
        data: { ...dto, category: 'general', status: 'new' },
      });
      expect(emailService.sendContactNotification).toHaveBeenCalledWith(
        expectedContact,
      );
      expect(result).toEqual(expectedContact);
    });
  });

  describe('respondToContact', () => {
    it('should send email and update contact status', async () => {
      const id = '1';
      const response = 'Thank you';
      const contact = { id, email: 'john@example.com', name: 'John' };

      mockPrismaService.contact.findUnique.mockResolvedValue(contact);
      mockPrismaService.contact.update.mockResolvedValue({
        ...contact,
        status: 'responded',
      });

      await service.respondToContact(id, response);

      expect(emailService.sendContactResponse).toHaveBeenCalledWith(
        contact,
        response,
      );
      expect(prisma.contact.update).toHaveBeenCalledWith({
        where: { id },
        data: expect.objectContaining({
          adminResponse: response,
          status: 'responded',
        }),
      });
    });
  });

  describe('generateAiResponse', () => {
    it('should call AI service with correct prompt', async () => {
      const id = '1';
      const contact = {
        id,
        name: 'John',
        message: 'Help me',
        category: 'Support',
      };
      mockPrismaService.contact.findUnique.mockResolvedValue(contact);
      mockAiService.generateText.mockResolvedValue('AI Suggestion');

      const result = await service.generateAiResponse(id, 'en');

      expect(aiService.generateText).toHaveBeenCalled();
      expect(result).toEqual({ suggestion: 'AI Suggestion' });
    });
  });
});
