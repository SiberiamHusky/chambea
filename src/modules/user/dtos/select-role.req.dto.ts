import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserType } from '../../../shared/enums';

export class SelectRoleDto {
  @ApiProperty({
    enum: UserType,
    description: 'Tipo de rol que el usuario desea seleccionar',
    examples: {
      worker: {
        value: UserType.WORKER,
        description: 'Seleccionar rol de trabajador para buscar trabajos',
      },
      employer: {
        value: UserType.EMPLOYER,
        description: 'Seleccionar rol de empleador para ofrecer trabajos',
      },
    },
  })
  @IsNotEmpty({ message: 'El tipo de usuario es requerido.' })
  @IsEnum(UserType, {
    message: 'El rol debe ser "worker" (trabajador) o "employer" (empleador).',
  })
  user_type: UserType;
}
