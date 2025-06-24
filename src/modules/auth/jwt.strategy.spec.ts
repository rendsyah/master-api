import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { AppConfigService } from 'src/commons/config';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AppConfigService,
          useValue: {
            JWT_SECRET: 'secret',
          },
        },
        {
          provide: AuthService,
          useValue: {
            session: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('validate', () => {
    const mockParams = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    it('should return UnauthorizedException if session false', async () => {
      (authService.session as jest.Mock).mockResolvedValue({ session: false });

      await expect(strategy.validate(mockParams)).rejects.toThrow(UnauthorizedException);
    });

    it('should return params if session true', async () => {
      (authService.session as jest.Mock).mockResolvedValue({ session: true });

      const result = await strategy.validate(mockParams);

      expect(result).toEqual(mockParams);
      expect(authService.session).toHaveBeenCalledWith(mockParams);
    });
  });
});
