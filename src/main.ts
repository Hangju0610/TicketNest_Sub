import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as apm from 'elastic-apm-node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  apm.start({
    serviceName: 'Sub_Test',
    serverUrl: configService.get<string>('APM_SERVER_URL'),
  });

  await app.listen(3000);
}
bootstrap();
