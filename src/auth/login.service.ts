import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/loginDto';

@Injectable()
export class LoginService extends AuthService {
  constructor(
    protected prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    super(prisma);
  }

  /**
   * Autentica um usuário e retorna um token JWT somente se o status for aprovado.
   * @param data - Dados de login (email ou CPF e senha).
   * @returns Token JWT de autenticação.
   * @throws UnauthorizedException se o usuário não existir ou senha incorreta.
   * @throws ForbiddenException se o usuário não estiver aprovado.
   */
  async login(data: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.emailOrCpf }, { cpf: data.emailOrCpf }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    const isMatch = await bcrypt.compare(data.pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    if (!user.status) {
      throw new ForbiddenException(
        'Seu acesso ainda não foi aprovado. Aguarde a aprovação.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      cpf: user.cpf,
      status: user.status,
    };

    const token = await this.jwtService.signAsync(payload);

    return { user: user, access_token: token };
  }
}
