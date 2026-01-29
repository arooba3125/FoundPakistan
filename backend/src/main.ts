import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration - allow frontend URLs
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.setGlobalPrefix('api');

  // Increase body size limit to handle file uploads (50MB)
  app.use((req, res, next) => {
    req.on('data', () => {});
    next();
  });

  // Configure JSON body size limit
  const json = require('body-parser').json({ limit: '50mb' });
  const urlencoded = require('body-parser').urlencoded({ limit: '50mb', extended: true });
  app.use(json);
  app.use(urlencoded);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Use PORT env variable (Render provides this) or fallback to 3001
  const port = process.env.PORT || process.env.APP_PORT || 3001;
  await app.listen(port);
  console.log(`✅ Backend running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('❌ Failed to start backend:', err);
  process.exit(1);
});

