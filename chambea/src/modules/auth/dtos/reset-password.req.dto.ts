import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordReqDto {
  @ApiProperty({ description: 'Token de recuperación recibido por email' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña. 8-20 caracteres, mayúscula, minúscula y dígito o símbolo.',
    example: 'NuevaPassSegura!123',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  new_password: string;
}
