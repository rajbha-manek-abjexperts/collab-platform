import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 3002);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3002}`);
  console.log(`API available at: http://localhost:${process.env.PORT ?? 3002}/api`);
  console.log(`WebSocket available at: http://localhost:${process.env.PORT ?? 3002}/api/socket.io`);
}
bootstrap();
