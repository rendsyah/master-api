import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { User } from 'src/commons/decorators';
import { JwtAuthGuard } from 'src/commons/guards';

import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';

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
  async me(@User() user: Utils.IUser): Promise<Response.Me> {
    return await this.authService.me(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/menu')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user menu' })
  async menu(@User() user: Utils.IUser): Promise<Response.Menu> {
    return await this.authService.menu(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/permission')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get permission user' })
  async permission(@User() user: Utils.IUser): Promise<Response.Permission[]> {
    return await this.authService.permission(user);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login authentication' })
  async login(@Body() dto: LoginDto): Promise<Response.Login> {
    return await this.authService.login(dto);
  }
}
