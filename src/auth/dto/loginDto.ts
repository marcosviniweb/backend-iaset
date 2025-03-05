import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail ou CPF do usuário',
    example: 'usuario@email.com',
  })
  @IsString()
  emailOrCpf: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
  })
  @IsString()
  pass: string;
}
