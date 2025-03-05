import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from './dto/loginDto';
import {
  ApiTags,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';

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
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas.',
    schema: {
      example: {
        statusCode: 401,
        message: 'E-mail ou senha inválidos',
      },
    },
  })
  async login(@Body() data: LoginDto) {
    return this.loginService.login(data);
  }
}
