import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RegisterModule } from './register/register.module';
import { UserModule } from './user/user.module';
import { DependentsModule } from './dependents/dependents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RegisterModule,
    UserModule,
    DependentsModule,
  ],
})
export class AppModule {}
