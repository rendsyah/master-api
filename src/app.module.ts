import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AppConfigModule, AppConfigService } from './commons/config';
import { AppLoggerModule } from './commons/logger';
import { UtilsModule } from './commons/utils';
import { TraceMiddleware } from './commons/middlewares';
import { AllExceptionsFilter } from './commons/filters';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  TransformInterceptor,
} from './commons/interceptors';

import { RunnerModule } from './datasources/runner';

import { AuthModule } from './modules/auth/auth.module';
import { MasterModule } from './modules/master/master.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'public'),
      serveRoot: '/media',
      exclude: ['/api/v1/*path'],
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
          extra: {
            min: 0,
            max: 20,
            idleTimeoutMillis: 10000,
          },
          connectTimeoutMS: 10000,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        } as TypeOrmModuleOptions;
      },
    }),
    AppConfigModule,
    AppLoggerModule,
    UtilsModule,
    RunnerModule,

    AuthModule,
    MasterModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  static port: number;
  static docs: number;

  constructor(private readonly appConfigService: AppConfigService) {
    AppModule.port = this.appConfigService.API_PORT;
    AppModule.docs = this.appConfigService.API_DOCS;
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes({ path: '/v1/*path', method: RequestMethod.ALL });
  }
}
