import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { ExecutionContext } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

describe('NewsletterController', () => {
  let controller: NewsletterController;
  let service: NewsletterService;

  const mockNewsletterService = {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    sendToAll: jest.fn(),
  };

  const mockGuard = {
    canActivate: (context: ExecutionContext) => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [
        { provide: NewsletterService, useValue: mockNewsletterService },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<NewsletterController>(NewsletterController);
    service = module.get<NewsletterService>(NewsletterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
