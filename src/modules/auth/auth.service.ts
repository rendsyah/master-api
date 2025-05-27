import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppConfigService } from 'src/commons/config';
import { UtilsService } from 'src/commons/utils';
import { User, UserAccessDetail, UserDevice, UserSession } from 'src/datasources/entities';

import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    @InjectRepository(UserAccessDetail)
    private readonly UserAccessDetailRepository: Repository<UserAccessDetail>,
    @InjectRepository(UserDevice)
    private readonly UserDeviceRepository: Repository<UserDevice>,
    @InjectRepository(UserSession)
    private readonly UserSessionRepository: Repository<UserSession>,
  ) {}

  /**
   * Handle sign session service
   * @param params
   * @returns
   */
  private async signSession(
    params: Omit<Utils.IUser, 'iat' | 'exp'>,
  ): Promise<Response.SignSession> {
    const getNow = Math.floor(Date.now() / 1000);
    const getRandomChar = this.utilsService.validateRandomChar(5, 'alphanumeric');
    const getSession = `${getNow}:${getRandomChar}`;

    const getAccessToken = await this.jwtService.signAsync(params, {
      secret: this.appConfigService.JWT_SECRET,
      expiresIn: this.appConfigService.JWT_EXPIRES_IN,
    });

    const result = {
      access_token: getAccessToken,
      session_id: getSession,
    };

    return result;
  }

  /**
   * Handle session service
   * @param user
   * @returns
   */
  async session(user: Utils.IUser): Promise<Response.Session> {
    const userSession = await this.UserSessionRepository.findOne({
      where: { user_id: user.id },
      select: ['session_id'],
    });

    const result = {
      session: false,
    };

    if (!userSession) {
      return result;
    }

    const [sign] = userSession.session_id.split(':').map(Number);
    result.session = sign <= user.iat;

    return result;
  }

  /**
   * Handle me service
   * @param user
   * @returns
   */
  async me(user: Utils.IUser): Promise<Response.Me> {
    const getUser = await this.UserRepository.findOne({
      where: { id: user.id },
      select: ['id'],
    });

    if (!getUser) {
      throw new UnauthorizedException();
    }

    const result = {
      id: user.id,
      name: user.name,
      access: user.access,
    };

    return result;
  }

  /**
   * Handle menu service
   * @param user
   * @returns
   */
  async menu(user: Utils.IUser): Promise<Response.Menu> {
    const getMenu = await this.UserAccessDetailRepository.createQueryBuilder('access_det')
      .innerJoin('access_det.menu', 'menu')
      .innerJoin('access_det.user_access', 'access')
      .innerJoin('access.user', 'user')
      .select([
        'menu.id AS id',
        'menu.name AS name',
        'menu.path AS path',
        'menu.icon AS icon',
        'menu.level AS level',
        'menu.header AS header',
      ])
      .where('user.id = :user', { user: user.id })
      .orderBy('menu.id', 'ASC')
      .addOrderBy('menu.sort', 'ASC')
      .getRawMany();

    if (getMenu.length === 0) {
      throw new ForbiddenException(`Sorry, you don't have access to this resource.`);
    }

    const result: Utils.IMenu[] = [];
    const resultMap = new Map<number, Utils.IMenu>();

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
  async permission(user: Utils.IUser): Promise<Response.Permission[]> {
    const getPermission: Response.Permission[] =
      await this.UserAccessDetailRepository.createQueryBuilder('access_det')
        .innerJoin('access_det.menu', 'menu')
        .innerJoin('access_det.user_access', 'access')
        .innerJoin('access.user', 'user')
        .select([
          'menu.id AS id',
          'menu.path AS path',
          'access_det.m_created AS m_created',
          'access_det.m_updated AS m_updated',
          'access_det.m_deleted AS m_deleted',
        ])
        .where('user.id = :id', { id: user.id })
        .getRawMany();

    if (getPermission.length === 0) {
      throw new ForbiddenException(`Sorry, you don't have access to this resource.`);
    }

    return getPermission;
  }

  /**
   * Handle login service
   * @param dto
   * @returns
   */
  async login(dto: LoginDto): Promise<Response.Login> {
    const getUser = await this.UserRepository.createQueryBuilder('user')
      .innerJoin('user.user_access', 'user_access')
      .select(['user.id', 'user.access_id', 'user.fullname', 'user.password', 'user_access.name'])
      .where('user.username = :user AND user.status = 1', { user: dto.user })
      .getOne();

    if (!getUser) throw new BadRequestException('Username or password is incorrect');

    const getCompare = await this.utilsService.validateCompare(getUser.password, dto.password);

    if (!getCompare) throw new BadRequestException('Username or password is incorrect');

    const getDirection = await this.UserAccessDetailRepository.createQueryBuilder('access_det')
      .innerJoin('access_det.user_access', 'access')
      .innerJoin('access_det.menu', 'menu')
      .innerJoin('access.user', 'user')
      .select(['menu.path AS path'])
      .where('access.id = :access_id', { access_id: getUser.access_id })
      .andWhere("menu.path != ''")
      .orderBy('menu.id', 'ASC')
      .addOrderBy('menu.sort', 'ASC')
      .getRawOne();

    if (!getDirection) {
      throw new ForbiddenException(`Sorry, you don't have access to this resource.`);
    }

    const userSession = await this.signSession({
      id: getUser.id,
      name: getUser.fullname,
      access: getUser.user_access.name,
    });

    const checkUserSession = await this.UserSessionRepository.findOne({
      where: { user_id: getUser.id },
      select: ['id'],
    });

    if (!checkUserSession) {
      await this.UserSessionRepository.insert({
        user_id: getUser.id,
        session_id: userSession.session_id,
      });
    } else {
      await this.UserSessionRepository.update(
        {
          id: checkUserSession.id,
        },
        {
          session_id: userSession.session_id,
        },
      );
    }

    const checkUserDevice = await this.UserDeviceRepository.findOne({
      where: { user_id: getUser.id },
      select: ['id'],
    });

    if (!checkUserDevice) {
      await this.UserDeviceRepository.insert({
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
      await this.UserDeviceRepository.update(
        {
          user_id: getUser.id,
        },
        {
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
        },
      );
    }

    const result = {
      access_token: userSession.access_token,
      redirect_to: getDirection.path,
    };

    return result;
  }
}
