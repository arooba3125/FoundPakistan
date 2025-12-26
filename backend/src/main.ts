import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.APP_PORT ?? 3001;
  await app.listen(port);
  console.log(`✅ Backend running on http://localhost:${port}/api`);
}
bootstrap().catch((err) => {
  console.error('❌ Failed to start backend:', err);
  process.exit(1);
});

