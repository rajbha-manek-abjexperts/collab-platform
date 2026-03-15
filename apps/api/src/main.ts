import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createServer } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpServer = createServer();
  
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new IoAdapter(httpServer));
  
  await app.listen(process.env.PORT ?? 3002);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3002}`);
}
bootstrap();
