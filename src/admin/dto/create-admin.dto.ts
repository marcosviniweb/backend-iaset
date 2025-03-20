import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Administrador' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@exemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    example: 'admin',
    description: 'Papel do usuário: admin, editor ou viewer',
    default: 'admin',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Status do usuário (ativo/inativo)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
