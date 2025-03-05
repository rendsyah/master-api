import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

import { IUser, UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { User, UserAccess, UserAccessDetail } from 'src/datasources/entities';

import { CreateAccessDto, UpdateAccessDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly runnerService: RunnerService,

    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    @InjectRepository(UserAccess)
    private readonly UserAccessRepository: Repository<UserAccess>,
  ) {}

  /**
   * Handle user service
   * @param user
   * @returns
   */
  async user(user: IUser) {
    return await this.UserRepository.createQueryBuilder('user')
      .select(['user.id', 'user.fullname', 'user.email', 'user.phone', 'user.image'])
      .where('user.id = :user', { user: user.id })
      .getOne();
  }

  /**
   * Handle create access service
   * @param dto
   * @param user
   * @returns
   */
  async createAccess(dto: CreateAccessDto, user: IUser) {
    const check = await this.UserAccessRepository.createQueryBuilder('access')
      .select(['access.id'])
      .where('LOWER(access.name) = LOWER(:name)', { name: dto.name })
      .getOne();

    if (check) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDescription = this.utilsService.validateUpperCase(dto.description);

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      const access = await queryRunner.manager.insert(UserAccess, {
        name: formatName,
        description: formatDescription,
        path: '/dashboard',
        permission: dto.permission,
        created_by: user.id,
      });

      const mapDetail = dto.access_detail.map((item) => {
        return {
          access_id: +access.generatedMaps[0].id,
          menu_id: item.menu_id,
          m_created: item.m_created,
          m_view: item.m_view,
          m_updated: item.m_updated,
          m_deleted: item.m_deleted,
        };
      });

      await queryRunner.manager
        .createQueryBuilder(UserAccessDetail, 'access_det')
        .insert()
        .into(UserAccessDetail)
        .values(mapDetail)
        .execute();
    });

    return {
      message: 'Successfully created',
    };
  }

  /**
   * Handle update access service
   * @param dto
   * @param user
   * @returns
   */
  async updateAccess(dto: UpdateAccessDto, user: IUser) {
    const access = await this.UserAccessRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id'],
    });

    if (!access) {
      throw new NotFoundException();
    }

    const check = await this.UserAccessRepository.createQueryBuilder('access')
      .select(['access.id'])
      .where('LOWER(access.name) = LOWER(:name)', { name: dto.name })
      .getOne();

    if (check && check.id !== dto.id) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDescription = this.utilsService.validateUpperCase(dto.description);

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      await queryRunner.manager.update(
        UserAccess,
        { id: dto.id },
        {
          name: formatName,
          description: formatDescription,
          path: '/dashboard',
          permission: dto.permission,
          status: dto.status,
          updated_by: user.id,
        },
      );

      await queryRunner.manager.delete(UserAccessDetail, { access_id: dto.id });

      const mapDetail = dto.access_detail.map((item) => {
        return {
          access_id: dto.id,
          menu_id: item.menu_id,
          m_created: item.m_created,
          m_view: item.m_view,
          m_updated: item.m_updated,
          m_deleted: item.m_deleted,
        };
      });

      await queryRunner.manager
        .createQueryBuilder(UserAccessDetail, 'access_det')
        .insert()
        .into(UserAccessDetail)
        .values(mapDetail)
        .execute();
    });

    return {
      message: 'Successfully updated',
    };
  }
}
