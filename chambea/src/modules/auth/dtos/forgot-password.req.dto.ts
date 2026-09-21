import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordReqDto {
  @ApiProperty({ description: 'Correo del usuario para solicitar recuperación', example: 'usuario@correo.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
