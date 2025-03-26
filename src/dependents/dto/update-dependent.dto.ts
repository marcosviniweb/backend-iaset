import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDependentDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome do dependente',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: '2016-01-01',
    description: 'Data de nascimento do dependente',
    required: false,
  })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({
    example: 'Filho',
    description: 'Relação com o funcionário',
    required: false,
  })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiProperty({
    example: '123.456.789-00',
    description: 'CPF do dependente',
    required: false,
  })
  @IsOptional()
  @IsString()
  cpf?: string;
  
  @ApiProperty({
    example: true,
    description: 'Status do dependente (aprovado ou não)',
    required: false,
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
  status?: boolean;
}

export default UpdateDependentDto;
