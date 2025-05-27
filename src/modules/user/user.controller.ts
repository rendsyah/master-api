import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { User } from 'src/commons/decorators';

import { UserService } from './user.service';
import { CreateAccessDto, UpdateAccessDto } from './user.dto';

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
  async user(@User() user: Utils.IUser): Promise<Response.User> {
    return await this.userService.user(user);
  }

  @Post('/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create access' })
  async createAccess(
    @Body() dto: CreateAccessDto,
    @User() user: Utils.IUser,
  ): Promise<Response.CreateAccess> {
    return await this.userService.createAccess(dto, user);
  }

  @Patch('/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update access' })
  async updateAccess(
    @Body() dto: UpdateAccessDto,
    @User() user: Utils.IUser,
  ): Promise<Response.UpdateAccess> {
    return await this.userService.updateAccess(dto, user);
  }
}
