import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { MockModel, MockQueryBuilder, QueryBuilder } from 'src/commons/mocks';

import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;

  let mockModel: MockModel;
  let mockQB: MockQueryBuilder;

  beforeEach(async () => {
    mockQB = QueryBuilder;
    mockModel = jest.fn().mockReturnValue(QueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: 'default',
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getApplicationList', () => {
    const mockExpectedResult = {
      id: 1,
      name: 'Master Application',
      version: '1.0.0',
    };

    it('should return NotFoundException if no data', async () => {
      mockQB.first.mockResolvedValue(null);

      await expect(() => service.getApplication()).rejects.toThrow(NotFoundException);
    });

    it('should return application data if found', async () => {
      mockQB.first.mockResolvedValue(mockExpectedResult);

      const result = await service.getApplication();

      expect(result).toEqual(mockExpectedResult);
    });
  });
});
