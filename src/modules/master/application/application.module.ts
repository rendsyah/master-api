import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterApplication } from 'src/datasources/entities';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterApplication])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
