import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { UserType } from '../../../shared/enums';

export class SelectRoleDto {
  @ApiProperty({
    enum: [UserType.WORKER, UserType.EMPLOYER],
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
  @IsIn([UserType.WORKER, UserType.EMPLOYER], {
    message: 'El rol debe ser "worker" (trabajador) o "employer" (empleador).',
  })
  user_type: UserType;
}
