import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsISO8601 } from 'class-validator';

export class CreateDependentDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2010-05-20' })
  @IsISO8601({ strict: true, strictSeparator: true })
  birthDate: string;

  @ApiProperty({ example: 'Filha' })
  @IsString()
  relationship: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Certidão de nascimento ou RG/CPF do dependente',
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

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  cpf?: string;
}
