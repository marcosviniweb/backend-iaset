import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'E-mail ou CPF do usuário' })
  @IsString()
  emailOrCpf: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  pass: string;
}
