import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '12345', required: false })
  @IsString()
  @IsOptional()
  matricula?: string;

  @ApiProperty({ example: '123.456.789-10' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ example: '12.345.678-9', required: false })
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiProperty({ example: 'Servidor Público', required: false })
  @IsString()
  @IsOptional()
  vinculo?: string;

  @ApiProperty({ example: 'Secretaria de Saúde', required: false })
  @IsString()
  @IsOptional()
  lotacao?: string;

  @ApiProperty({ example: 'Rua Exemplo, 123', required: false })
  @IsString()
  @IsOptional()
  endereco?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '(11) 98765-4321', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'senha123', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsDateString()
  @IsOptional()
  birthDay?: string;

  @ApiProperty({ example: true, default: true, required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase().trim();
    if (str === 'true' || str === '1') return true;
    if (str === 'false' || str === '0') return false;
    return value; // Caso seja outro valor, @IsBoolean() vai falhar
  })
  firstAccess?: boolean;

  @ApiProperty({
    example: true,
    default: false,
    description: 'Status do usuário (aprovado ou não)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase().trim();
    if (str === 'true' || str === '1') return true;
    if (str === 'false' || str === '0') return false;
    return value;
  })
  status?: boolean;
}
