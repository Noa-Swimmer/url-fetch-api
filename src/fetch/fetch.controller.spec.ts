import { Test, TestingModule } from '@nestjs/testing';
import { FetchController } from './fetch.controller';
import { FetchService } from './fetch.service';

describe('FetchController', () => {
  let controller: FetchController;
  let service: FetchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FetchController],
      providers: [
        {
          provide: FetchService,
          useValue: {
            enqueue: jest.fn().mockReturnValue({ count: 1, urls: ['https://example.com'] }),
            getAll: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<FetchController>(FetchController);
    service = module.get<FetchService>(FetchService);
  });

  it('should call enqueue on POST', () => {
    const res = controller.create({ urls: ['https://example.com'] } as any);
    expect((service.enqueue as jest.Mock).mock.calls.length).toBe(1);
    expect(res).toEqual({ count: 1, urls: ['https://example.com'] });
  });

  it('should return items on GET', () => {
    const res = controller.findAll();
    expect((service.getAll as jest.Mock).mock.calls.length).toBe(1);
    expect(res).toEqual([]);
  });
});
