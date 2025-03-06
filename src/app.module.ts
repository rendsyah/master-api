import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UtilsModule } from './commons/utils';
import { AllExceptionsFilter } from './commons/filters';
import { LoggingInterceptor, TimeoutInterceptor } from './commons/interceptors';
import { AppConfigModule, AppConfigService } from './commons/config';
import { AppLoggerService } from './commons/logger';

import { RunnerModule } from './datasources/runner';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
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
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => {
        return {
          type: configService.DB_TYPE,
          host: configService.DB_HOST,
          port: configService.DB_PORT,
          username: configService.DB_USER,
          password: configService.DB_PASS,
          database: configService.DB_NAME,
          synchronize: false,
          logging: false,
          connectTimeoutMS: 10000,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        } as TypeOrmModuleOptions;
      },
    }),
    AppConfigModule,
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

  constructor(private readonly appConfigService: AppConfigService) {
    AppModule.port = this.appConfigService.API_PORT;
    AppModule.docs = this.appConfigService.API_DOCS;
  }
}
