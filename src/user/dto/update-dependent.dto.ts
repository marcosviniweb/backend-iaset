import { ApiProperty } from '@nestjs/swagger';

export class UpdateDependentDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome do dependente',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: '2016-01-01',
    description: 'Data de nascimento do dependente',
    required: false,
  })
  birthDate?: string;

  @ApiProperty({
    example: 'Filho',
    description: 'Relação com o funcionário',
    required: false,
  })
  relationship?: string;
}
