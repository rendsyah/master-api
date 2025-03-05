import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { urlencoded, json } from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';

import { SwaggerService } from './commons/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: (origin: string, cb) => {
      const allowedOrigins = ['http://localhost:3000'];
      const isAllowed = allowedOrigins.includes(origin);
      cb(null, isAllowed);
    },
  });

  app.use(helmet());
  app.use(urlencoded({ extended: true }));
  app.use(json({ limit: '50mb' }));

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  patchNestJsSwagger();

  if (AppModule.docs) {
    const swaggerDocs = SwaggerService(app);
    SwaggerModule.setup('/api/docs', app, swaggerDocs);
  }

  await app.listen(AppModule.port, () => console.log(`SERVER RUNNING ON PORT ${AppModule.port}`));
}
bootstrap();
