import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DependentDto } from './dependent.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
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
    type: 'string',
    format: 'binary',
    description: 'Certidão de nascimento ou RG/CPF',
  })
  @IsOptional()
  certidaoNascimentoOuRGCPF?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Comprovante de casamento ou união estável',
  })
  @IsOptional()
  comprovanteCasamentoOuUniao?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Documento de adoção, se aplicável',
  })
  @IsOptional()
  documentoAdocao?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Comprovante de matrícula da faculdade, se aplicável',
  })
  @IsOptional()
  comprovanteMatriculaFaculdade?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Laudo médico para filhos deficientes',
  })
  @IsOptional()
  laudoMedicoFilhosDeficientes?: string;

  @ApiPropertyOptional({
    type: [DependentDto],
    description: 'Lista de dependentes do usuário',
    example: [
      {
        name: 'Maria Silva',
        birthDate: '2010-05-20',
        relationship: 'Filha',
      },
      {
        name: 'Carlos Silva',
        birthDate: '2012-09-15',
        relationship: 'Filho',
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DependentDto)
  dependents?: DependentDto[];
}
