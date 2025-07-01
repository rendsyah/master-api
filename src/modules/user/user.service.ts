import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';

import { CreateAccessDto, ListUserDto, UpdateAccessDto } from './user.dto';
import { ListUserResponse, UserResponse } from './user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly utilsService: UtilsService,

    @InjectConnection()
    private readonly model: Knex,
  ) {}

  /**
   * Handle user service
   * @param user
   * @returns
   */
  async user(user: IUser): Promise<UserResponse> {
    const getUser = await this.model('user')
      .innerJoin('user_access AS access', 'access.id', 'user.access_id')
      .select(
        'user.id AS id',
        'user.fullname AS fullname',
        'access.name AS access_name',
        'user.email AS email',
        'user.phone AS phone',
        'user.image AS image',
      )
      .where('user.id', user.id)
      .first();

    if (!getUser) {
      throw new NotFoundException('User not found');
    }

    return {
      id: getUser.id,
      fullname: getUser.fullname,
      access_name: getUser.access_name,
      email: getUser.email,
      phone: getUser.phone,
      image: getUser.image,
    };
  }

  /**
   * Handle get list user service
   * @param dto
   * @returns
   */
  async getListUser(dto: ListUserDto): Promise<ListUserResponse> {
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

    const baseQuery = this.model('user').innerJoin(
      'user_access AS access',
      'access.id',
      'user.access_id',
    );

    if (search) {
      baseQuery.andWhere('user.fullname', 'ILIKE', `%${search}%`);
    }

    if (status !== undefined) {
      baseQuery.andWhere('user.status', status);
    }

    if (startDate && endDate) {
      baseQuery.andWhereRaw('DATE("user".created_at) BETWEEN ? AND ?', [startDate, endDate]);
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select(
        'user.id AS id',
        'user.fullname AS fullname',
        'access.name AS access_name',
        'user.email AS email',
        'user.phone AS phone',
        'user.status AS status',
        this.model.raw(
          `
          CASE
            WHEN "user"."status" = 1 THEN 'Active'
            ELSE 'Inactive'
          END AS status_text
        `,
        ),
        'user.created_at AS created_at',
        'user.updated_at AS updated_at',
      )
      .orderBy(orderBy, sort)
      .offset(Number(skip))
      .limit(Number(limit));

    const [items, countResult] = await Promise.all([itemsQuery, countQuery.count().first()]);

    const totalData = Number(countResult?.count ?? 0);

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
  async createAccess(dto: CreateAccessDto, user: IUser): Promise<MutationResponse> {
    const checkAccess = await this.model('user_access')
      .select('id')
      .whereRaw('LOWER(name) = LOWER(?)', [dto.name])
      .first();

    if (checkAccess) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDescription = this.utilsService.validateUpperCase(dto.description);

    await this.model.transaction(async (trx) => {
      const accessResult = await trx('user_access')
        .insert({
          name: formatName,
          description: formatDescription,
          created_by: user.id,
        })
        .returning('*');

      const insertAccessDetail = dto.access_detail.map((item) => {
        return {
          access_id: +accessResult[0].id,
          menu_id: item.menu_id,
          m_created: item.m_created,
          m_updated: item.m_updated,
          m_deleted: item.m_deleted,
          created_by: user.id,
        };
      });

      await trx('user_access_detail').insert(insertAccessDetail);
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
  async updateAccess(dto: UpdateAccessDto, user: IUser): Promise<MutationResponse> {
    const getAccess = await this.model('user_access')
      .select('id', 'name', 'created_by')
      .where({ id: dto.id })
      .first();

    if (!getAccess) {
      throw new NotFoundException('Access not found');
    }

    if (getAccess.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkAccess = await this.model('user_access')
        .select('id')
        .whereRaw('LOWER(name) = LOWER(?)', [dto.name])
        .first();

      if (checkAccess) {
        throw new BadRequestException('Name already exists');
      }
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDescription = this.utilsService.validateUpperCase(dto.description);

    await this.model.transaction(async (trx) => {
      await trx('user_access').where('id', dto.id).update({
        name: formatName,
        description: formatDescription,
        status: dto.status,
        updated_by: user.id,
      });

      await trx('user_access_detail').where({ access_id: dto.id }).delete();

      const insertAccessDetail = dto.access_detail.map((item) => {
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

      await trx('user_access_detail').insert(insertAccessDetail);
    });

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
