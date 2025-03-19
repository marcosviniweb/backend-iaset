import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `http://iaset.com.br/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperação de Senha',
      template: './reset-password', // Arquivo Handlebars
      context: {
        resetUrl,
      },
    });

    return { message: 'E-mail de recuperação enviado com sucesso.' };
  }
}
