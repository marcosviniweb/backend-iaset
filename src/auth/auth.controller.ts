import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dto/LoginDto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginService: LoginService) {}

  /**
   * Autentica um usuário e retorna um token JWT.
   * @param data - Dados de login (email ou CPF e senha).
   * @returns Token JWT de autenticação.
   */
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.loginService.login(data);
  }
}
