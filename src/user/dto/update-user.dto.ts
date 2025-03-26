import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsISO8601,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  matricula?: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  cpf?: string;

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
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Status do funcionário (aprovado ou não)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase().trim();
    if (str === 'true' || str === '1') return true;
    if (str === 'false' || str === '0') return false;
    return value; // Se vier algo diferente, falha em @IsBoolean()
  })
  status?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica se é o primeiro acesso do usuário',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase().trim();
    if (str === 'true' || str === '1') return true;
    if (str === 'false' || str === '0') return false;
    return value;
  })
  firstAccess?: boolean;

  @ApiPropertyOptional({
    example: '1995-07-15',
    description: 'Data de nascimento do usuário (formato ISO8601)',
  })
  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  birthDay?: string;

  @ApiPropertyOptional({
    example: 'senha123',
    description: 'Nova senha do usuário (opcional)',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
