import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AppConfigService } from 'src/commons/config';
import { IUser } from 'src/commons/utils/utils.types';

import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    appConfigService: AppConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.JWT_SECRET,
    });
  }

  async validate(params: IUser): Promise<IUser> {
    const getSession = await this.authService.session(params);
    const { session } = getSession;

    if (!session) {
      throw new UnauthorizedException();
    }

    return params;
  }
}
