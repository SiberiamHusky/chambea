import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageResponseDto {
  @ApiProperty({
    description: 'Identificador único del mensaje',
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario que envía el mensaje',
    example: 'user-1',
  })
  senderId: string;

  @ApiProperty({
    description: 'ID del usuario receptor del mensaje',
    example: 'user-2',
  })
  receiverId: string;

  @ApiProperty({
    description: 'Contenido del mensaje',
    example: 'Hola, ¿cómo estás?',
  })
  content: string;

  @ApiProperty({
    description: 'Fecha y hora de creación del mensaje',
    example: new Date().toISOString(),
  })
  createdAt: Date;
}
