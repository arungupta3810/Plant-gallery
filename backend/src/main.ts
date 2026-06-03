import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Express } from 'express';
import { AppModule } from './app.module';

/**
 * Configures a Nest application with the global prefix, validation pipe and
 * CORS. Shared by the standalone server (local / non-Vercel hosting) and the
 * serverless handler (api/index.ts on Vercel).
 *
 * Pass an existing Express instance to attach Nest to it (serverless); omit it
 * to let Nest create its own HTTP server (local dev).
 */
export async function createApp(expressInstance?: Express): Promise<INestApplication> {
  const app = expressInstance
    ? await NestFactory.create(AppModule, new ExpressAdapter(expressInstance))
    : await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins, credentials: true });

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Plant Gallery API running on http://localhost:${port}/api`);
}

// Only start a listening server when run directly (local dev / non-serverless
// hosts). On Vercel the handler in api/index.ts imports createApp instead.
if (require.main === module) {
  bootstrap();
}
