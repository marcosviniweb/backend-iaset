import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do funcionário',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'joao@email.com',
    description: 'E-mail do funcionário',
    required: false,
  })
  email?: string;

  @ApiProperty({
    example: '999999999',
    description: 'Telefone do funcionário',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    example: true,
    description: 'Status do funcionário (aprovado ou não)',
    required: false,
  })
  status?: boolean;
}
