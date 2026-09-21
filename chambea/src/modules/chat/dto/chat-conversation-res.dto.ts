import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../../shared/enums';

export class ChatConversationResponseDto {
  @ApiProperty({ description: 'ID del otro usuario en la conversación', example: 'user-2' })
  otherUserId: string;

  @ApiProperty({ description: 'Nombre del otro usuario', example: 'Juan Perez', required: false })
  otherUserName?: string;

  @ApiProperty({ description: 'Email del otro usuario', example: 'juan@example.com', required: false })
  otherUserEmail?: string;

  @ApiProperty({ description: 'Tipo del otro usuario', enum: UserType, required: false })
  otherUserType?: UserType;

  @ApiProperty({ description: 'Contenido del último mensaje', example: 'Hola, ¿agendamos entrevista?' })
  lastMessageContent: string;

  @ApiProperty({ description: 'Fecha y hora del último mensaje', example: new Date().toISOString() })
  lastMessageAt: Date;
}
