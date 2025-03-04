import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DependentDto } from './dependent.dto';

export class RegisterDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  matricula?: string;

  @IsString()
  cpf: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  vinculo?: string;

  @IsOptional()
  @IsString()
  lotacao?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  status?: boolean; // Campo de status adicionado

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DependentDto)
  dependents?: DependentDto[];
}
