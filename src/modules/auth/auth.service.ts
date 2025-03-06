import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppConfigService } from 'src/commons/config';
import { IUser, UtilsService } from 'src/commons/utils';
import { User, UserAccessDetail, UserDevice, UserSession } from 'src/datasources/entities';

import { LoginDto } from './auth.dto';
import { ReponseMenu } from './auth.types';

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
  private async signSession(params: Omit<IUser, 'iat' | 'exp'>) {
    const getNow = Math.floor(Date.now() / 1000);
    const getRandomChar = this.utilsService.validateRandomChar(5, 'alphanumeric');
    const getSession = `${getNow}:${getRandomChar}`;

    const getToken = await this.jwtService.signAsync(params, {
      secret: this.appConfigService.JWT_SECRET,
      expiresIn: this.appConfigService.JWT_EXPIRES_IN,
    });

    return {
      access_token: getToken,
      session_id: getSession,
    };
  }

  /**
   * Handle session service
   * @param user
   * @returns
   */
  async session(user: IUser) {
    const userSession = await this.UserSessionRepository.findOne({
      where: { user_id: user.id },
      select: ['session_id'],
    });

    if (!userSession) {
      return {
        session: false,
      };
    }

    const [sessionId] = userSession.session_id.split(':').map(Number);

    return {
      session: sessionId <= user.iat,
    };
  }

  /**
   * Handle me service
   * @param user
   * @returns
   */
  async me(user: IUser) {
    const getUser = await this.UserRepository.findOne({
      where: { id: user.id },
      select: ['id'],
    });

    if (!getUser) {
      throw new UnauthorizedException();
    }

    return user;
  }

  /**
   * Handle menu service
   * @param user
   * @returns
   */
  async menu(user: IUser) {
    const getMenu = await this.UserAccessDetailRepository.createQueryBuilder('access_det')
      .innerJoin('access_det.menu', 'menu')
      .innerJoin('access_det.user_access', 'access')
      .innerJoin('access.user', 'user')
      .select([
        'menu.id',
        'menu.name',
        'menu.path',
        'menu.icon',
        'menu.level',
        'menu.header',
        'access_det.m_created',
        'access_det.m_view',
        'access_det.m_updated',
        'access_det.m_deleted',
      ])
      .where('user.id = :user', { user: user.id })
      .orderBy('menu.id', 'ASC')
      .addOrderBy('menu.sort', 'ASC')
      .getMany();

    const response: ReponseMenu[] = [];
    const responseMap = new Map<number, ReponseMenu>();

    for (const menu of getMenu) {
      const data: ReponseMenu = {
        id: menu.menu.id,
        name: menu.menu.name,
        path: menu.menu.path,
        icon: menu.menu.icon,
        permission: {
          m_created: menu.m_created,
          m_view: menu.m_view,
          m_updated: menu.m_updated,
          m_deleted: menu.m_deleted,
        },
        child: [],
      };

      responseMap.set(data.id, data);

      if (menu.menu.header === 0) {
        response.push(data);
      } else {
        const parent = responseMap.get(menu.menu.header);
        if (parent) parent.child.push(data);
      }
    }

    return response;
  }

  /**
   * Handle login service
   * @param dto
   * @returns
   */
  async login(dto: LoginDto) {
    const getUser = await this.UserRepository.createQueryBuilder('user')
      .innerJoinAndSelect('user.user_access', 'user_access')
      .select([
        'user.id',
        'user.fullname',
        'user.password',
        'user_access.name',
        'user_access.path',
        'user_access.permission',
      ])
      .where('user.username = :user AND user.status = 1', { user: dto.user })
      .getOne();

    if (!getUser) {
      throw new BadRequestException('Username or password is incorrect');
    }

    const getCompare = await this.utilsService.validateCompare(getUser.password, dto.password);

    if (!getCompare) {
      throw new BadRequestException('Username or password is incorrect');
    }

    const userSession = await this.signSession({
      id: getUser.id,
      name: getUser.fullname,
      access: getUser.user_access.name,
      permission: getUser.user_access.permission,
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
        device_imei: dto.device.device_imei,
        device_name: dto.device.device_name,
        device_os: dto.device.device_os,
        device_platform: dto.device.device_platform,
        app_version: dto.device.app_version,
      });
    } else {
      await this.UserDeviceRepository.update(
        {
          user_id: getUser.id,
        },
        {
          firebase_id: dto.device.firebase_id,
          device_imei: dto.device.device_imei,
          device_name: dto.device.device_name,
          device_os: dto.device.device_os,
          device_platform: dto.device.device_platform,
          app_version: dto.device.app_version,
        },
      );
    }

    return {
      access_token: userSession.access_token,
      redirect_to: getUser.user_access.path,
    };
  }
}
