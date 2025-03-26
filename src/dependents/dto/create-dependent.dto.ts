import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDependentDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2016-01-01' })
  @IsString()
  birthDate: string;

  @ApiProperty({ example: 'Filho' })
  @IsString()
  relationship: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  cpf: string;

  @ApiProperty({
    example: false,
    description: 'Status do dependente (aprovado ou não)',
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

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'Documento do dependente (RG, CPF, Certidão de Nascimento, etc)',
  })
  file?: Express.Multer.File;
}
