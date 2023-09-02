import * as apm from 'elastic-apm-node';
require('dotenv').config();
apm.start({
  serviceName: 'Consumer_Server',
  serverUrl: process.env.APM_SERVER_URL,
  logLevel: 'off',
});
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  await app.listen(3000);
}
bootstrap();
