import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { MasterApplication } from 'src/datasources/entities';

import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let applicationRepository: jest.Mocked<Repository<MasterApplication>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(MasterApplication),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    applicationRepository = module.get(getRepositoryToken(MasterApplication));
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

    const queryBuilder = (data: unknown) => {
      return {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(data),
      } as unknown as SelectQueryBuilder<MasterApplication>;
    };

    beforeEach(() => {
      jest.clearAllMocks();

      applicationRepository.createQueryBuilder.mockReturnValue(queryBuilder(mockExpectedResult));
    });

    it('should return NotFoundException if no data', async () => {
      applicationRepository.createQueryBuilder.mockReturnValue(queryBuilder(null));

      await expect(() => service.getApplication()).rejects.toThrow(NotFoundException);
    });

    it('should return application data if found', async () => {
      const result = await service.getApplication();

      expect(result).toEqual(mockExpectedResult);
    });
  });
});
