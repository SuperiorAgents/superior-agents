import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BootstrapLogger } from './logger.instance';
import { CatchEverythingFilter } from './exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = BootstrapLogger();
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  
  app.setGlobalPrefix('api/v1');
  const configService = app.get(ConfigService);
  const adapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new CatchEverythingFilter(adapterHost, logger)); 

  const config = new DocumentBuilder()
    .setTitle('Multi DEX Aggerator swap API')
    .setDescription('Swap API support signers for multiple DEX aggerators')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  if (!configService.get('PORT')) {
    logger.log('PORT env is missing using 3000')
  }

  await app.listen(configService.get('PORT') || 3000);
}

bootstrap();
