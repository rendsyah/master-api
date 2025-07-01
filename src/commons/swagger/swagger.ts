import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export const SwaggerService = (app: INestApplication): OpenAPIObject => {
  const document = new DocumentBuilder()
    .setTitle('Master API')
    .setDescription('Official Master API Documentation')
    .setTermsOfService('http://example.com/terms')
    .setContact('Developer', 'http://www.example.com/support', 'example@gmail.com')
    .setVersion('1.0')
    .setLicense('Apache 2.0', 'https://www.apache.org/licenses/LICENSE-2.0.html')
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, document);
};
