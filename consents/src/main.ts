import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // This will result in a url to allow visiting "didomi.io/api/v1/"
  // TODO Add nested route if desired to have "/api/v1/consents/users"
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Consents')
    .setDescription('Consent and user storage API.')
    .setVersion('1.0')
    .addTag('consents')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
