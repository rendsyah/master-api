import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UtilsModule } from './commons/utils';
import { AllExceptionsFilter } from './commons/filters';
import { LoggingInterceptor, TimeoutInterceptor } from './commons/interceptors';
import { AppLoggerService } from './commons/logger';

import {
  MasterGeneral,
  MasterMenu,
  User,
  UserAccess,
  UserAccessDetail,
  UserDevice,
  UserForgot,
  UserSession,
} from './datasources/entities';
import { RunnerModule } from './datasources/runner';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/api/v1/image',
      serveStaticOptions: {
        cacheControl: true,
        maxAge: '1y',
        immutable: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.getOrThrow('DB_TYPE', { infer: true }),
          host: configService.getOrThrow('DB_HOST', { infer: true }),
          port: configService.getOrThrow('DB_PORT', { infer: true }),
          username: configService.getOrThrow('DB_USER', { infer: true }),
          password: configService.getOrThrow('DB_PASS', { infer: true }),
          database: configService.getOrThrow('DB_NAME', { infer: true }),
          synchronize: false,
          logging: false,
          connectTimeoutMS: 10000,
          entities: [
            MasterGeneral,
            MasterMenu,
            User,
            UserAccess,
            UserAccessDetail,
            UserDevice,
            UserForgot,
            UserSession,
          ],
        } as TypeOrmModuleOptions;
      },
    }),
    UtilsModule,
    RunnerModule,

    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLoggerService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {
  static port: number;
  static docs: number;

  constructor(private readonly configService: ConfigService) {
    AppModule.port = this.configService.getOrThrow('API_PORT', 8080, { infer: true });
    AppModule.docs = this.configService.getOrThrow('API_DOCS', 0, { infer: true });
  }
}
