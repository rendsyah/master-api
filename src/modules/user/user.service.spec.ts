import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UtilsService } from 'src/commons/utils';
import { MockModel, MockQueryBuilder, MockTransaction, QueryBuilder } from 'src/commons/mocks';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  let mockModel: MockModel;
  let mockQB: MockQueryBuilder;
  let mockTransaction: MockTransaction;

  let utilsService: jest.Mocked<UtilsService>;

  beforeEach(async () => {
    mockQB = QueryBuilder;
    mockTransaction = jest.fn().mockReturnValue(QueryBuilder);
    mockModel = jest.fn().mockReturnValue(QueryBuilder);
    mockModel.raw = jest.fn((sql: string) => sql);
    mockModel.transaction = jest.fn((cb) => cb(mockTransaction));

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
          provide: 'default',
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    utilsService = module.get(UtilsService);
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

    it('should return NotFoundException if no data', async () => {
      mockQB.first.mockResolvedValue(null);

      await expect(service.user(mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should return user data if found', async () => {
      mockQB.first.mockResolvedValue(mockExpectedResult);

      const result = await service.user(mockUser);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('getUserList', () => {
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

    beforeEach(() => {
      utilsService.pagination.mockReturnValue(mockPagination);
      utilsService.paginationResponse.mockReturnValue(mockExpectedResult);
    });

    it('should return user list if found', async () => {
      mockQB.then = jest.fn((cb) => cb(mockUserQuery) as unknown);

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

    const mockAccessQuery = [
      {
        id: 1,
      },
    ];

    const mockExpectedResult = {
      success: true,
      message: 'Successfully created',
    };

    beforeEach(() => {
      mockQB.first.mockResolvedValue(null);

      utilsService.validateUpperCase
        .mockReturnValueOnce('Admin')
        .mockReturnValueOnce('Administrator Access');

      mockQB.returning.mockResolvedValue(mockAccessQuery);
    });

    it('should return BadRequestException if access already exists', async () => {
      mockQB.first.mockResolvedValue(mockAccessQuery);

      await expect(service.createAccess(mockDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should return success after created access', async () => {
      const result = await service.createAccess(mockDto, mockUser);

      expect(result).toEqual(mockExpectedResult);
      expect(mockTransaction).toHaveBeenCalledWith('user_access');
      expect(mockTransaction).toHaveBeenCalledWith('user_access_detail');
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
      utilsService.validateUpperCase
        .mockReturnValueOnce('Administrator')
        .mockReturnValueOnce('Administrator Access');
    });

    it('should return NotFoundException if no data', async () => {
      mockQB.first.mockResolvedValue(null);

      await expect(service.updateAccess(mockDto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should return BadRequestException if name already exists', async () => {
      mockQB.first
        .mockResolvedValueOnce({
          id: 1,
          name: 'Admin',
        })
        .mockResolvedValueOnce({ id: 1 });

      await expect(service.updateAccess(mockDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should return success after updated access', async () => {
      mockQB.first.mockResolvedValue({
        id: 1,
        name: 'Administrator',
      });

      mockQB.update.mockResolvedValue({});
      mockQB.delete.mockResolvedValue({});
      mockQB.insert.mockResolvedValue({});

      const result = await service.updateAccess(mockDto, mockUser);

      expect(result).toEqual(mockExpectedResult);
      expect(mockTransaction).toHaveBeenCalledWith('user_access');
      expect(mockTransaction).toHaveBeenCalledWith('user_access_detail');
    });
  });
});
