import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'senhaAntiga123' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'novaSenhaSegura123' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  newPassword: string;
}
