/*
 * author: ninlyu.dev@outlook.com
 */
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import compression from '@fastify/compress';
import { RequestMethod } from '@nestjs/common';
import 'module-alias/register';
import { config } from '@/config';
import { AppModule } from '@/app.module';
import { globalGuards } from '@/middleware/guard';
import { loadGlobalInterceptors } from '@/middleware/interceptor';
import { loadGlobalFilters } from '@/middleware/filter';
import { globalAdapters } from '@/middleware/adapter';

async function bootstrap() {
  console.info(`Running at :${config.app.port}`);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: config.log.levels,
      cors: config.app.cors,
    },
  );
  app.setGlobalPrefix(config.app.prefix, {
    exclude: [{ path: '/heartbeat', method: RequestMethod.HEAD }],
  });
  app.register(compression, { global: true });
  globalGuards(app);
  loadGlobalInterceptors(app);
  loadGlobalFilters(app);
  globalAdapters(app);
  await app.listen(config.app.port, config.app.host);
}
bootstrap();
