import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppConfigService } from 'src/commons/config';
import { UtilsService } from 'src/commons/utils';
import { MockModel, MockQueryBuilder, QueryBuilder } from 'src/commons/mocks';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  let mockModel: MockModel;
  let mockQB: MockQueryBuilder;

  let utilsService: jest.Mocked<UtilsService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    mockQB = QueryBuilder;
    mockModel = jest.fn().mockReturnValue(QueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AppConfigService,
          useValue: {
            JWT_SECRET: 'secret',
            JWT_EXPIRES_IN: '1d',
          },
        },
        {
          provide: UtilsService,
          useValue: {
            validateCompare: jest.fn(),
            validateRandomChar: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: 'default',
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    utilsService = module.get(UtilsService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signSession', () => {
    const mockParams = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
    };

    const mockExpectedResult = {
      access_token: 'token',
      session_id: '1718529600:AB123',
    };

    it('should return session signature data if found', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1718529600000);

      utilsService.validateRandomChar.mockReturnValue('AB123');
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.signSession(mockParams);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('session', () => {
    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    it('should return session: false if no data', async () => {
      mockQB.first.mockResolvedValue(null);

      const result = await service.session(mockUser);

      expect(result).toEqual({ session: false });
    });

    it('should return session: false if session sign is > user.iat', async () => {
      mockQB.first.mockResolvedValue({ session_id: '1001:abcde' });

      const result = await service.session(mockUser);

      expect(result).toEqual({ session: false });
    });

    it('should return session: true if session sign is <= user.iat', async () => {
      mockQB.first.mockResolvedValue({ session_id: '999:abcde' });

      const result = await service.session(mockUser);

      expect(result).toEqual({ session: true });
    });
  });

  describe('me', () => {
    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockExpectedResult = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
    };

    it('should return UnauthorizedException if no data', async () => {
      mockQB.first.mockResolvedValue(null);

      await expect(service.me(mockUser)).rejects.toThrow(UnauthorizedException);
    });

    it('should return me data if found', async () => {
      mockQB.first.mockResolvedValue({ id: 1 });

      const result = await service.me(mockUser);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('menu', () => {
    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockMenuQuery = [
      {
        id: 1,
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'Dashboard',
        level: 1,
        header: 0,
      },
      {
        id: 2,
        name: 'Ecommerce',
        path: '/dashboard/e-commerce',
        icon: 'Ecommerce',
        level: 2,
        header: 1,
      },
    ];

    const mockExpectedResult = [
      {
        id: 1,
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'Dashboard',
        level: 1,
        child: [
          {
            id: 2,
            name: 'Ecommerce',
            path: '/dashboard/e-commerce',
            icon: 'Ecommerce',
            level: 2,
            child: [],
          },
        ],
      },
    ];

    it('should return ForbiddenException if no data', async () => {
      mockQB.then = jest.fn((cb) => cb([]) as unknown);

      await expect(service.menu(mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should return menu data if found', async () => {
      mockQB.then = jest.fn((cb) => cb(mockMenuQuery) as unknown);

      const result = await service.menu(mockUser);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('permission', () => {
    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockExpectedResult = [
      {
        id: 1,
        path: '/dashboard',
        m_created: 1,
        m_updated: 1,
        m_deleted: 1,
      },
    ];

    it('should return ForbiddenException if no data', async () => {
      mockQB.then = jest.fn((cb) => cb([]) as unknown);

      await expect(service.permission(mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should return permission data if found', async () => {
      mockQB.then = jest.fn((cb) => cb(mockExpectedResult) as unknown);

      const result = await service.permission(mockUser);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('login', () => {
    const mockDto = {
      user: 'admin',
      password: 'admin',
      device: {
        firebase_id: '',
        device_browser: 'Chrome',
        device_browser_version: '113',
        device_imei: '',
        device_model: 'Macbook Pro',
        device_type: 'laptop',
        device_vendor: 'Apple',
        device_os: 'MacOS',
        device_os_version: '13',
        device_platform: 'Web' as 'Web' | 'Mobile',
        user_agent: 'Mozilla/5.0',
        app_version: '1.0.0',
      },
    };

    const mockUserQuery = {
      id: 1,
      access_id: 1,
      fullname: 'Admin',
      password: 'admin',
      access_name: 'Administrator',
    };

    const mockNextPathQuery = {
      path: '/dashboard',
    };

    const mockSignSession = {
      access_token: 'token',
      session_id: '1234567890',
    };

    const mockExpectedResult = {
      access_token: 'token',
      redirect_to: '/dashboard',
    };

    beforeEach(() => {
      utilsService.validateCompare.mockResolvedValue(true);
      jest.spyOn(service, 'signSession').mockResolvedValue(mockSignSession);
    });

    it('should return BadRequestException if no data', async () => {
      mockQB.first.mockResolvedValue(null);

      await expect(service.login(mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should return BadRequestException if password is wrong', async () => {
      mockQB.first.mockResolvedValue(mockUserQuery);
      utilsService.validateCompare.mockResolvedValue(false);
      await expect(service.login(mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should return ForbiddenException if direction not found', async () => {
      mockQB.first.mockResolvedValueOnce(mockUserQuery).mockResolvedValueOnce(null);
      await expect(service.login(mockDto)).rejects.toThrow(ForbiddenException);
    });

    it('should return login data if found with insert session and device', async () => {
      mockQB.first
        .mockResolvedValueOnce(mockUserQuery)
        .mockResolvedValueOnce(mockNextPathQuery)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockQB.insert.mockResolvedValueOnce({}).mockResolvedValueOnce({});

      const result = await service.login(mockDto);

      expect(result).toEqual(mockExpectedResult);

      expect(service.signSession).toHaveBeenCalledWith({
        id: mockUserQuery.id,
        name: mockUserQuery.fullname,
        access_name: mockUserQuery.access_name,
      });

      expect(mockQB.insert).toHaveBeenCalled();
      expect(mockQB.update).not.toHaveBeenCalled();
    });

    it('should return login data if found with update session and device', async () => {
      mockQB.first
        .mockResolvedValueOnce(mockUserQuery)
        .mockResolvedValueOnce(mockNextPathQuery)
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1 });

      mockQB.update.mockResolvedValueOnce({}).mockResolvedValueOnce({});

      const result = await service.login(mockDto);

      expect(result).toEqual(mockExpectedResult);

      expect(service.signSession).toHaveBeenCalledWith({
        id: mockUserQuery.id,
        name: mockUserQuery.fullname,
        access_name: mockUserQuery.access_name,
      });

      expect(mockQB.update).toHaveBeenCalled();
      expect(mockQB.insert).not.toHaveBeenCalled();
    });
  });
});
