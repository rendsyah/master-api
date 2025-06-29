import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { UserService } from './user.service';
import { CreateAccessDto, ListUserDto, UpdateAccessDto } from './user.dto';
import { ListUserResponse, UserResponse } from './user.types';

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
  @ApiOperation({ summary: 'Get list user' })
  async getListUser(@Query() dto: ListUserDto): Promise<ListUserResponse> {
    return await this.userService.getListUser(dto);
  }

  @Post('/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create access' })
  async createAccess(@Body() dto: CreateAccessDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.userService.createAccess(dto, user);
  }

  @Patch('/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update access' })
  async updateAccess(@Body() dto: UpdateAccessDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.userService.updateAccess(dto, user);
  }
}
