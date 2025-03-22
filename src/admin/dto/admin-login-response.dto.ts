import { ApiProperty } from '@nestjs/swagger';

export class AdminResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Admin' })
  name: string;

  @ApiProperty({ example: 'admin@exemplo.com' })
  email: string;

  @ApiProperty({ example: 'admin' })
  role: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-03-21T08:30:00.000Z' })
  lastLogin: Date;

  @ApiProperty({ example: '2025-03-15T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-03-21T08:30:00.000Z' })
  updatedAt: Date;
}

export class AdminLoginResponseDto {
  @ApiProperty({ type: AdminResponseDto })
  admin: AdminResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autenticação',
  })
  access_token: string;
}
