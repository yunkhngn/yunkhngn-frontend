import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

const mockPrismaService = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
};

const mockNotificationsGateway = {
  sendNotification: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and emit event', async () => {
      const dto = {
        type: 'CONTACT',
        message: 'New message',
        link: '/admin/contact',
      };
      const createdNotification = {
        id: '1',
        ...dto,
        read: false,
        createdAt: new Date(),
      };

      mockPrismaService.notification.create.mockResolvedValue(
        createdNotification,
      );

      const result = await service.create(dto.type, dto.message, dto.link);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(gateway.sendNotification).toHaveBeenCalledWith(
        createdNotification,
      );
      expect(result).toEqual(createdNotification);
    });
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const notifications = [{ id: '1', message: 'test' }];
      const total = 1;
      mockPrismaService.notification.findMany.mockResolvedValue(notifications);
      mockPrismaService.notification.count.mockResolvedValue(total);
      // Mock unread count
      mockPrismaService.notification.count
        .mockResolvedValueOnce(total)
        .mockResolvedValueOnce(0);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(notifications);
      expect(result.meta.total).toEqual(total);
    });
  });
});
