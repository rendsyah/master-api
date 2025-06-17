import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { UserService } from './user.service';
import { CreateAccessDto, UpdateAccessDto, UserListDto } from './user.dto';
import {
  CreateAccessResponse,
  UpdateAccessResponse,
  UserListResponse,
  UserResponse,
} from './user.types';

@UseGuards(JwtAuthGuard)
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async user(@User() user: IUser): Promise<UserResponse> {
    return await this.userService.user(user);
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user list' })
  async getUserList(@Query() dto: UserListDto): Promise<UserListResponse> {
    return await this.userService.getUserList(dto);
  }

  @Post('/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create access' })
  async createAccess(
    @Body() dto: CreateAccessDto,
    @User() user: IUser,
  ): Promise<CreateAccessResponse> {
    return await this.userService.createAccess(dto, user);
  }

  @Patch('/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update access' })
  async updateAccess(
    @Body() dto: UpdateAccessDto,
    @User() user: IUser,
  ): Promise<UpdateAccessResponse> {
    return await this.userService.updateAccess(dto, user);
  }
}
