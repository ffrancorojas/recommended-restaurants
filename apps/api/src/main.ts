import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from './config';
import { setupApp } from './setup';

async function bootstrap() {
  const config = getConfig();
  const app = await NestFactory.create(AppModule);
  setupApp(app, config.corsOrigins);
  app.enableShutdownHooks();
  await app.listen(config.port, config.host);
  console.log(`API: http://${config.host}:${config.port}/api/docs`);
}

void bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'No se pudo iniciar la API.');
  process.exitCode = 1;
});
