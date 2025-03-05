import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { User } from 'src/commons/decorators';
import { IUser } from 'src/commons/utils';
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
  async me(@User() user: IUser) {
    return await this.authService.me(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/menu')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user menu' })
  async menu(@User() user: IUser) {
    return await this.authService.menu(user);
  }

  @Post('/login')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: 'Login authentication' })
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }
}
