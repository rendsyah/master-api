import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { User, UserAccess } from 'src/datasources/entities';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  let utilsService: jest.Mocked<UtilsService>;
  let runnerService: jest.Mocked<RunnerService>;

  let userRepository: jest.Mocked<Repository<User>>;
  let userAccessRepository: jest.Mocked<Repository<UserAccess>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: RunnerService,
          useValue: {
            runTransaction: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserAccess),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    utilsService = module.get(UtilsService);
    runnerService = module.get(RunnerService);

    userRepository = module.get(getRepositoryToken(User));
    userAccessRepository = module.get(getRepositoryToken(UserAccess));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('user', () => {
    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockExpectedResult = {
      id: 1,
      fullname: 'Admin',
      access_name: 'Administrator',
      email: 'admin@gmail.com',
      phone: '08123456789',
      image: '',
    };

    const queryBuilder = (data: unknown) => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(data),
      } as unknown as SelectQueryBuilder<User>;
    };

    beforeEach(() => {
      userRepository.createQueryBuilder.mockReturnValue(queryBuilder(mockExpectedResult));
    });

    it('should return NotFoundException if no data', async () => {
      userRepository.createQueryBuilder.mockReturnValue(queryBuilder(null));

      await expect(service.user(mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should return user data if found', async () => {
      const result = await service.user(mockUser);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('getListUser', () => {
    const mockDto = {
      page: 1,
      limit: 10,
      status: 1,
      search: 'admin',
      startDate: '2022-01-01',
      endDate: '2022-12-31',
    };

    const mockPagination = {
      ...mockDto,
      skip: 0,
    };

    const mockUserQuery = {
      id: 1,
      fullname: 'Admin',
      access_name: 'Administrator',
      email: 'admin@gmail.com',
      phone: '08123456789',
      status: 1,
      status_text: 'Active',
      created_at: '2022-01-01 00:00:00',
      updated_at: '2022-01-01 00:00:00',
    };

    const mockExpectedResult = {
      items: [mockUserQuery],
      meta: {
        page: 1,
        totalData: 1,
        totalPage: 1,
        totalPerPage: 10,
      },
    };

    const queryBuilder = (data: unknown) => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(data),
        getCount: jest.fn().mockResolvedValue(1),
      } as unknown as SelectQueryBuilder<User>;
    };

    beforeEach(() => {
      utilsService.pagination.mockReturnValue(mockPagination);

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder(mockUserQuery));

      utilsService.paginationResponse.mockReturnValue(mockExpectedResult);
    });

    it('should return user list if found', async () => {
      const result = await service.getListUser(mockDto);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('createAccess', () => {
    const mockDto = {
      name: 'Administrator',
      description: 'Administrator Access',
      access_detail: [
        {
          menu_id: 1,
          m_created: 1,
          m_updated: 1,
          m_deleted: 1,
        },
      ],
    };

    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockAccessQuery = {
      id: 1,
    };

    const mockExpectedResult = {
      success: true,
      message: 'Successfully created',
    };

    const queryBuilder = (data: unknown) => {
      return {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(data),
      } as unknown as SelectQueryBuilder<UserAccess>;
    };

    beforeEach(() => {
      userAccessRepository.createQueryBuilder.mockReturnValue(queryBuilder(null));

      utilsService.validateUpperCase
        .mockReturnValueOnce('Admin')
        .mockReturnValueOnce('Administrator Access');

      const mockInsertAccessRunner = jest.fn().mockResolvedValue({
        generatedMaps: [{ id: 1 }],
      });

      const mockInsertAccessDetailRunner = jest.fn().mockReturnValue({
        insert: () => ({
          into: () => ({
            values: () => ({
              execute: jest.fn().mockResolvedValue({}),
            }),
          }),
        }),
      });

      const mockQueryRunner = {
        manager: {
          insert: mockInsertAccessRunner,
          createQueryBuilder: mockInsertAccessDetailRunner,
        },
      };

      runnerService.runTransaction.mockImplementation(async (cb) => {
        return cb(mockQueryRunner as unknown as QueryRunner);
      });
    });

    it('should return BadRequestException if access already exists', async () => {
      userAccessRepository.createQueryBuilder.mockReturnValue(queryBuilder(mockAccessQuery));

      await expect(service.createAccess(mockDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should return success after created access', async () => {
      const result = await service.createAccess(mockDto, mockUser);

      expect(result).toEqual(mockExpectedResult);

      expect(runnerService.runTransaction).toHaveBeenCalled();
    });
  });

  describe('updateAccess', () => {
    const mockDto = {
      id: 1,
      name: 'Administrator',
      description: 'Administrator Access',
      access_detail: [
        {
          menu_id: 1,
          m_created: 1,
          m_updated: 1,
          m_deleted: 1,
        },
      ],
      status: 1,
    };

    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockExpectedResult = {
      success: true,
      message: 'Successfully updated',
    };

    beforeEach(() => {
      userAccessRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Administrator',
      } as unknown as UserAccess);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      } as unknown as SelectQueryBuilder<UserAccess>;

      userAccessRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      utilsService.validateUpperCase
        .mockReturnValueOnce('Administrator')
        .mockReturnValueOnce('Administrator Access');

      const mockUpdateAccessRunner = jest.fn().mockResolvedValue({});

      const mockDeleteAccessRunner = jest.fn().mockResolvedValue({});

      const mockInsertAccessDetailRunner = jest.fn().mockReturnValue({
        insert: () => ({
          into: () => ({
            values: () => ({
              execute: jest.fn().mockResolvedValue({}),
            }),
          }),
        }),
      });

      const mockQueryRunner = {
        manager: {
          update: mockUpdateAccessRunner,
          delete: mockDeleteAccessRunner,
          createQueryBuilder: mockInsertAccessDetailRunner,
        },
      };

      runnerService.runTransaction.mockImplementation(async (cb) => {
        return cb(mockQueryRunner as unknown as QueryRunner);
      });
    });

    it('should return NotFoundException if no data', async () => {
      userAccessRepository.findOne.mockResolvedValue(null);

      await expect(service.updateAccess(mockDto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should return BadRequestException if name already exists', async () => {
      userAccessRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Admin',
      } as unknown as UserAccess);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ id: 1 }),
      } as unknown as SelectQueryBuilder<UserAccess>;

      userAccessRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.updateAccess(mockDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should return success after updated access', async () => {
      const result = await service.updateAccess(mockDto, mockUser);

      expect(result).toEqual(mockExpectedResult);

      expect(runnerService.runTransaction).toHaveBeenCalled();
    });
  });
});
