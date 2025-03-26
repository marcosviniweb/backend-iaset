import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Se precisar habilitar CORS
  app.enableCors();

  // Retirado o "enableImplicitConversion: true"
  // para evitar converter "false" (string) em true
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,   // Mantém a transformação ativa
      whitelist: true,
    }),
  );

  // Define o prefixo '/api' para todas as rotas
  app.setGlobalPrefix('api');

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('IASET API')
    .setDescription('API do Sistema de Carteirinha IASET')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Porta
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
