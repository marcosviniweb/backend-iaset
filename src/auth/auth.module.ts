import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { LoginService } from './login.service';

@Module({
  imports: [
    PrismaModule,

    // Registra o JwtModule de forma assíncrona para ler do .env
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
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LoginService],
})
export class AuthModule {}
