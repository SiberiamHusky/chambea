import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomResponseDto {
  @ApiProperty({
    description: 'Mensaje de validación al unirse a una sala',
    example: 'Te has unido a la sala: user-123',
  })
  message: string;
}
