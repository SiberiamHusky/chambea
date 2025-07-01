import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserType } from '../user.entity';

export class SelectRoleDto {
  @ApiProperty({ enum: UserType, example: UserType.WORKER })
  @IsEnum(UserType, { message: 'El rol debe ser "worker" o "employer".' })
  user_type: UserType;
}
