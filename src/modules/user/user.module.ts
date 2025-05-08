import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, UserAccess, UserAccessDetail } from 'src/datasources/entities';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccess, UserAccessDetail])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
