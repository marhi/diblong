import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'docs', method: RequestMethod.ALL }],
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  // Nest emits `dist/src/main.js`, so `__dirname/../uploads` would wrongly resolve to `dist/uploads`.
  // Seed + MediaService write under `process.cwd()/uploads` (see UPLOAD_DIR in .env).
  const uploadsRelative = (process.env.UPLOAD_DIR ?? 'uploads').replace(/^\.\//, '');
  const uploadsDir = resolve(process.cwd(), uploadsRelative);
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });
  const origin = process.env.WEB_ORIGIN ?? 'http://localhost:4200';
  app.enableCors({
    origin: [origin, /^http:\/\/localhost:\d+$/],
    credentials: true,
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Diblong API')
    .setDescription('REST API for the Diblong premium webshop')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}
bootstrap();
