import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { User } from 'src/commons/decorators';
import { IUser } from 'src/commons/utils/utils.types';
import { JwtAuthGuard } from 'src/commons/guards';

import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { LoginResponse, MenuResponse, MeResponse, PermissionResponse } from './auth.types';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async me(@User() user: IUser): Promise<MeResponse> {
    return await this.authService.me(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/menu')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user menu' })
  async menu(@User() user: IUser): Promise<MenuResponse> {
    return await this.authService.menu(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/permission')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get permission user' })
  async permission(@User() user: IUser): Promise<PermissionResponse[]> {
    return await this.authService.permission(user);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login authentication' })
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(dto);
  }
}
