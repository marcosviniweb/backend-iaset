import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DependentDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2010-05-20' })
  @IsString()
  birthDate: string;

  @ApiProperty({ example: 'Filha' })
  @IsString()
  relationship: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    example: 'certidao_nascimento.pdf',
  })
  @IsOptional()
  certidaoNascimentoOuRGCPF?: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    example: 'comprovante_casamento.pdf',
  })
  @IsOptional()
  comprovanteCasamentoOuUniao?: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    example: 'documento_adocao.pdf',
  })
  @IsOptional()
  documentoAdocao?: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    example: 'matricula_facul.pdf',
  })
  @IsOptional()
  comprovanteMatriculaFaculdade?: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    example: 'laudo_medico.pdf',
  })
  @IsOptional()
  laudoMedicoFilhosDeficientes?: Express.Multer.File;
}
