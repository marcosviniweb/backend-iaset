import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DependentsModule } from './dependents/dependents.module';
import { AdminModule } from './admin/admin.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // false = STARTTLS
        auth: {
          user: process.env.MAIL_USER || 'mv.r.marcosvini@gmail.com',
          pass: process.env.MAIL_PASS || 'nflggirclvozjqkd',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@gmail.com>',
      },
      template: {
        dir: join(__dirname, '../src/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    DependentsModule,
    AdminModule,
  ],
})
export class AppModule {}
