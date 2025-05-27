import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
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
  async user(user: Utils.IUser): Promise<Response.User> {
    const getUser: Response.User = await this.UserRepository.createQueryBuilder('user')
      .innerJoin('user.user_access', 'access')
      .select([
        'user.id AS id',
        'user.fullname AS fullname',
        'access.name AS access',
        'user.email AS email',
        'user.phone AS phone',
        'user.image AS image',
      ])
      .where('user.id = :user', { user: user.id })
      .getRawOne();

    if (!getUser) {
      throw new NotFoundException('User not found');
    }

    return getUser;
  }

  /**
   * Handle create access service
   * @param dto
   * @param user
   * @returns
   */
  async createAccess(dto: CreateAccessDto, user: Utils.IUser): Promise<Response.CreateAccess> {
    const checkAccess = await this.UserAccessRepository.createQueryBuilder('access')
      .select(['access.id'])
      .where('LOWER(access.name) = LOWER(:name)', { name: dto.name })
      .getOne();

    if (checkAccess) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDescription = this.utilsService.validateUpperCase(dto.description);

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      const access = await queryRunner.manager.insert(UserAccess, {
        name: formatName,
        description: formatDescription,
        created_by: user.id,
      });

      const mapDetail = dto.access_detail.map((item) => {
        return {
          access_id: +access.generatedMaps[0].id,
          menu_id: item.menu_id,
          m_created: item.m_created,
          m_updated: item.m_updated,
          m_deleted: item.m_deleted,
          created_by: user.id,
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
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update access service
   * @param dto
   * @param user
   * @returns
   */
  async updateAccess(dto: UpdateAccessDto, user: Utils.IUser): Promise<Response.UpdateAccess> {
    const access = await this.UserAccessRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name'],
    });

    if (!access) {
      throw new NotFoundException('Access not found');
    }

    if (access.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkAccess = await this.UserAccessRepository.createQueryBuilder('access')
        .select(['access.id'])
        .where('LOWER(access.name) = LOWER(:name)', { name: dto.name })
        .getOne();

      if (checkAccess) {
        throw new BadRequestException('Name already exists');
      }
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
          status: dto.status,
          updated_by: user.id,
        },
      );

      await queryRunner.manager.delete(UserAccessDetail, {
        access_id: dto.id,
      });

      const mapDetail = dto.access_detail.map((item) => {
        return {
          access_id: dto.id,
          menu_id: item.menu_id,
          m_created: item.m_created,
          m_updated: item.m_updated,
          m_deleted: item.m_deleted,
          updated_by: user.id,
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
      success: true,
      message: 'Successfully updated',
    };
  }
}
