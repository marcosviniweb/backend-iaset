import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    example: 'admin@exemplo.com',
    description: 'Email do administrador',
    format: 'email',
    required: true,
  })
  @IsEmail({}, { message: 'Informe um email válido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do administrador',
    minLength: 6,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}
