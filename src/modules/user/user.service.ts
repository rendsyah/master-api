import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { IUser } from 'src/commons/utils/utils.types';
import { User, UserAccess, UserAccessDetail } from 'src/datasources/entities';

import { CreateAccessDto, UpdateAccessDto, UserListDto } from './user.dto';
import {
  CreateAccessResponse,
  UpdateAccessResponse,
  UserListResponse,
  UserResponse,
} from './user.types';

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
  async user(user: IUser): Promise<UserResponse> {
    const getUser: UserResponse = await this.UserRepository.createQueryBuilder('user')
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
   * Handle get user list service
   * @param dto
   * @returns
   */
  async getUserList(dto: UserListDto): Promise<UserListResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'user.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.UserRepository.createQueryBuilder('user')
      .innerJoin('user.user_access', 'access')
      .select([
        'user.id AS id',
        'user.fullname AS fullname',
        'access.name AS access',
        'user.email AS email',
        'user.phone AS phone',
        'user.status AS status',
        `CASE
            WHEN user.status = 1 THEN 'Active'
            ELSE 'Inactive'
         END AS status_text`,
        'user.created_at AS created_at',
        'user.updated_at AS updated_at',
      ]);

    if (search) {
      baseQuery.andWhere('user.fullname ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('user.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(user.created_date) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    baseQuery.orderBy(orderBy, sort);

    const [items, totalData] = await Promise.all([
      baseQuery.limit(limit).offset(skip).getRawMany(),
      baseQuery.getCount(),
    ]);

    return this.utilsService.paginationResponse({
      items,
      meta: {
        page,
        limit,
        totalData,
      },
    });
  }

  /**
   * Handle create access service
   * @param dto
   * @param user
   * @returns
   */
  async createAccess(dto: CreateAccessDto, user: IUser): Promise<CreateAccessResponse> {
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
  async updateAccess(dto: UpdateAccessDto, user: IUser): Promise<UpdateAccessResponse> {
    const getAccess = await this.UserAccessRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name', 'created_by'],
    });

    if (!getAccess) {
      throw new NotFoundException('Access not found');
    }

    if (getAccess.name.toLowerCase() !== dto.name.toLowerCase()) {
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
          created_by: getAccess.created_by,
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
