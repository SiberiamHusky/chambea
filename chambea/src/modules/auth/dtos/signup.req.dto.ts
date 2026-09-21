import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SignupReqDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida.' })
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Joc',
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres.' })
  @Matches(/^[A-Za-z]+$/, {
    message: 'El nombre debe contener solo letras.',
  })
  first_name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Ferreira',
  })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío.' })
  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @MinLength(3, { message: 'El apellido debe tener al menos 3 caracteres.' })
  @MaxLength(50, { message: 'El apellido no puede tener más de 50 caracteres.' })
  @Matches(/^[A-Za-z]+$/, {
    message: 'El apellido debe contener solo letras.',
  })
  last_name: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+58424360227',
  })
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío.' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })

  // 1) Debe comenzar con +58
  @Matches(/^\+58/, {
    message: 'El número debe comenzar con el código de país +58.',
  })
  // 2) Prefijo válido: 424, 426, 412, 414 o 416
  @Matches(/^\+58(?:424|426|412|414|416)/, {
    message: 'El prefijo debe ser uno de los siguientes: 424, 426, 412, 414 o 416.',
  })
  // 3) 10 dígitos adicionales
  @Matches(/^\+58(?:424|426|412|414|416)\d{7}$/, {
    message: 'El teléfono debe contener exactamente 7 dígitos después del prefijo.',
  })
  phone: string;

  @ApiProperty({
    description:
      'Password for the user account. Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one special character.',
    example: 'MySecure@Password!#',
  })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(20, { message: 'La contraseña no puede tener más de 20 caracteres.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un carácter especial.',
  })
  password: string;
}
