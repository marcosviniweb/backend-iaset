import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  @IsOptional()
  @IsString()
  name?: string;

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
  @Type(() => Boolean)
  status?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica se é o primeiro acesso do usuário',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
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
