import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsISO8601 } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  matricula?: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  cpf: string;

  @ApiPropertyOptional({ example: '12.345.678-9' })
  @IsString()
  rg: string;

  @ApiPropertyOptional({ example: 'Servidor Público' })
  @IsOptional()
  @IsString()
  vinculo?: string;

  @ApiPropertyOptional({ example: 'Secretaria de Saúde' })
  @IsOptional()
  @IsString()
  lotacao?: string;

  @ApiPropertyOptional({ example: 'Rua Exemplo, 123' })
  @IsString()
  endereco: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '(11) 99999-9999' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Foto do usuário',
  })
  @IsOptional()
  photo?: string;

  @ApiPropertyOptional({
    example: '1995-07-15',
    description: 'Data de nascimento do usuário (formato ISO8601)',
  })
  @IsISO8601({ strict: true, strictSeparator: true })
  birthDay: string;
}
