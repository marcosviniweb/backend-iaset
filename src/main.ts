import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validação global para os DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Autenticação')
    .setDescription(
      'Endpoints para autenticação e gerenciamento de dependentes',
    )
    .setVersion('1.0')
    .addBearerAuth() // Adiciona autenticação JWT na documentação
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // URL: http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
