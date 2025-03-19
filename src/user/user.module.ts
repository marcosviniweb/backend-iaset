import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    PrismaModule, // Registra o JwtModule de forma assíncrona para ler do .env
    JwtModule.registerAsync({
      imports: [ConfigModule], // garante que possamos injetar ConfigService
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // lê do .env
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'), // ex. "1d"
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService],
})
export class UserModule {}
