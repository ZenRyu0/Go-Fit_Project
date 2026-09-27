import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { apiLimiter, authLimiter } from './common/middleware/rate-limit.middleware';
import { logger } from './common/logger/winston.logger';

let cachedServer: any;

async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust proxy for rate limiting and X-Forwarded-For headers
  app.set('trust proxy', 1);

  // Enable CORS FIRST before any middleware
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [
            'https://letsgo-fit.netlify.app',
            'https://go-fit-frontend.netlify.app',
            'https://gofit.netlify.app',
          ]
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  });

  // Apply rate limiting
  app.use('/auth', authLimiter);
  app.use(apiLimiter);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  return app;
}

// Local development startup
if (!process.env.VERCEL) {
  createApp()
    .then(async (app) => {
      const port = process.env.PORT || 3000;
      await app.listen(port);
      logger.info(`Server running on http://localhost:${port}`);
    })
    .catch((error) => {
      logger.error('Failed to start server', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });
}

// Vercel Serverless handler export
export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await createApp();
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer(req, res);
}