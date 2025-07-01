import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { AppConfigService } from 'src/commons/config';
import { UtilsService } from 'src/commons/utils';
import { IMenu, IUser } from 'src/commons/utils/utils.types';

import { LoginDto } from './auth.dto';
import {
  LoginResponse,
  MenuResponse,
  MeResponse,
  PermissionResponse,
  SessionResponse,
  SignSessionResponse,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtService,

    @InjectConnection()
    private readonly model: Knex,
  ) {}

  /**
   * Handle sign session service
   * @param params
   * @returns
   */
  async signSession(params: Omit<IUser, 'iat' | 'exp'>): Promise<SignSessionResponse> {
    const getNow = Math.floor(Date.now() / 1000);
    const getRandomChar = this.utilsService.validateRandomChar(5, 'alphanumeric');
    const getSession = `${getNow}:${getRandomChar}`;

    const getAccessToken = await this.jwtService.signAsync(params, {
      secret: this.appConfigService.JWT_SECRET,
      expiresIn: this.appConfigService.JWT_EXPIRES_IN,
    });

    return {
      access_token: getAccessToken,
      session_id: getSession,
    };
  }

  /**
   * Handle session service
   * @param user
   * @returns
   */
  async session(user: IUser): Promise<SessionResponse> {
    const getSession = await this.model('user_session')
      .select('session_id')
      .where({ user_id: user.id })
      .first();

    if (!getSession) {
      return {
        session: false,
      };
    }

    const [sign] = getSession.session_id.split(':').map(Number);

    return {
      session: sign <= user.iat,
    };
  }

  /**
   * Handle me service
   * @param user
   * @returns
   */
  async me(user: IUser): Promise<MeResponse> {
    const getUser = await this.model('user').select('id').where({ id: user.id }).first();

    if (!getUser) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      name: user.name,
      access_name: user.access_name,
    };
  }

  /**
   * Handle menu service
   * @param user
   * @returns
   */
  async menu(user: IUser): Promise<MenuResponse> {
    const getMenu = await this.model('user_access_detail AS access_detail')
      .join('master_menu AS menu', 'menu.id', 'access_detail.menu_id')
      .join('user_access AS access', 'access.id', 'access_detail.access_id')
      .join('user', 'user.access_id', 'access.id')
      .select(
        'menu.id AS id',
        'menu.name AS name',
        'menu.path AS path',
        'menu.icon AS icon',
        'menu.level AS level',
        'menu.header AS header',
      )
      .where('user.id', user.id)
      .orderBy('menu.level', 'ASC')
      .orderBy('menu.sort', 'ASC')
      .orderBy('menu.id', 'ASC');

    if (getMenu.length === 0) {
      throw new ForbiddenException(`Sorry, you don't have access to this resource.`);
    }

    const result: IMenu[] = [];
    const resultMap = new Map<number, IMenu>();

    for (const menu of getMenu) {
      const data = {
        id: menu.id,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        level: menu.level,
        child: [],
      };

      resultMap.set(data.id, data);

      if (menu.header === 0) {
        result.push(data);
      } else {
        const parent = resultMap.get(menu.header);
        if (parent) parent.child.push(data);
      }
    }

    return result;
  }

  /**
   * Handle permission service
   * @param user
   * @returns
   */
  async permission(user: IUser): Promise<PermissionResponse[]> {
    const getPermission = await this.model('user_access_detail AS access_detail')
      .innerJoin('master_menu AS menu', 'menu.id', 'access_detail.menu_id')
      .innerJoin('user_access AS access', 'access.id', 'access_detail.access_id')
      .innerJoin('user', 'user.access_id', 'access.id')
      .select(
        'menu.id AS id',
        'menu.path AS path',
        'access_detail.m_created AS m_created',
        'access_detail.m_updated AS m_updated',
        'access_detail.m_deleted AS m_deleted',
      )
      .where('user.id', user.id)
      .andWhere('menu.path', '!=', '');

    if (getPermission.length === 0) {
      throw new ForbiddenException(`Sorry, you don't have access to this resource.`);
    }

    return getPermission as PermissionResponse[];
  }

  /**
   * Handle login service
   * @param dto
   * @returns
   */
  async login(dto: LoginDto): Promise<LoginResponse> {
    const getUser = await this.model('user')
      .innerJoin('user_access AS access', 'access.id', 'user.access_id')
      .select(
        'user.id AS id',
        'user.access_id AS access_id',
        'user.fullname AS fullname',
        'user.password AS password',
        'access.name AS access_name',
      )
      .where('user.username', dto.user)
      .andWhere('user.status', 1)
      .first();

    if (!getUser) throw new BadRequestException('Username or password is incorrect');

    const getCompare = await this.utilsService.validateCompare(getUser.password, dto.password);

    if (!getCompare) throw new BadRequestException('Username or password is incorrect');

    const getDirection = await this.model('user_access_detail AS access_detail')
      .innerJoin('user_access AS access', 'access.id', 'access_detail.access_id')
      .innerJoin('master_menu AS menu', 'menu.id', 'access_detail.menu_id')
      .innerJoin('user', 'user.access_id', 'access.id')
      .select('menu.path AS path')
      .where('access.id', getUser.access_id)
      .andWhere('menu.path', '!=', '')
      .orderBy('menu.level', 'ASC')
      .orderBy('menu.sort', 'ASC')
      .orderBy('menu.id', 'ASC')
      .first();

    if (!getDirection) {
      throw new ForbiddenException(`Sorry, you don't have access to this resource.`);
    }

    const getSession = await this.signSession({
      id: getUser.id,
      name: getUser.fullname,
      access_name: getUser.access_name,
    });

    const checkUserSession = await this.model('user_session')
      .select('id')
      .where({ user_id: getUser.id })
      .first();

    if (!checkUserSession) {
      await this.model('user_session').insert({
        user_id: getUser.id,
        session_id: getSession.session_id,
      });
    } else {
      await this.model('user_session')
        .where({ id: checkUserSession.id })
        .update({ session_id: getSession.session_id });
    }

    const checkUserDevice = await this.model('user_device')
      .select('id')
      .where({ user_id: getUser.id })
      .first();

    if (!checkUserDevice) {
      await this.model('user_device').insert({
        user_id: getUser.id,
        firebase_id: dto.device.firebase_id,
        device_browser: dto.device.device_browser,
        device_browser_version: dto.device.device_browser_version,
        device_imei: dto.device.device_imei,
        device_model: dto.device.device_model,
        device_type: dto.device.device_type,
        device_vendor: dto.device.device_vendor,
        device_os: dto.device.device_os,
        device_os_version: dto.device.device_os_version,
        device_platform: dto.device.device_platform,
        user_agent: dto.device.user_agent,
        app_version: dto.device.app_version,
      });
    } else {
      await this.model('user_device').where({ user_id: getUser.id }).update({
        firebase_id: dto.device.firebase_id,
        device_browser: dto.device.device_browser,
        device_browser_version: dto.device.device_browser_version,
        device_imei: dto.device.device_imei,
        device_model: dto.device.device_model,
        device_type: dto.device.device_type,
        device_vendor: dto.device.device_vendor,
        device_os: dto.device.device_os,
        device_os_version: dto.device.device_os_version,
        device_platform: dto.device.device_platform,
        user_agent: dto.device.user_agent,
        app_version: dto.device.app_version,
      });
    }

    return {
      access_token: getSession.access_token,
      redirect_to: getDirection.path,
    };
  }
}
