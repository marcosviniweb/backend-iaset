import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsISO8601,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiPropertyOptional({ example: 'Servidor Público' })
  @IsOptional()
  @IsString()
  vinculo?: string;

  @ApiPropertyOptional({ example: 'Secretaria de Saúde' })
  @IsOptional()
  @IsString()
  lotacao?: string;

  @ApiPropertyOptional({ example: 'Rua Exemplo, 123' })
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'senha123' })
  @IsOptional()
  @IsString()
  password?: string;

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
  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  birthDay?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se é o primeiro acesso do usuário',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  firstAccess?: boolean;
}
