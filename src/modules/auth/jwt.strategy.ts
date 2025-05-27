import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AppConfigService } from 'src/commons/config';

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

  async validate(params: Utils.IUser): Promise<Utils.IUser> {
    const getSession = await this.authService
      .session(params)
      .then((res) => res.session)
      .catch(() => false);

    if (!getSession) {
      throw new UnauthorizedException();
    }

    return params;
  }
}
