import { Body, Controller, Get, Patch, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { JwtAuthGuard } from 'src/commons/guards';
import { User } from 'src/commons/decorators';
import { IUser } from 'src/commons/utils';

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
  async user(@User() user: IUser) {
    return await this.userService.user(user);
  }

  @Post('/access')
  @UsePipes(ZodValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create access' })
  async createAccess(@Body() dto: CreateAccessDto, @User() user: IUser) {
    return await this.userService.createAccess(dto, user);
  }

  @Patch('/access')
  @UsePipes(ZodValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update access' })
  async updateAccess(@Body() dto: UpdateAccessDto, @User() user: IUser) {
    return await this.userService.updateAccess(dto, user);
  }
}
