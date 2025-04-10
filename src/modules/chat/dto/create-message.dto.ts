import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'Id del usuario que enviá el mensaje', example: '42b83a3b' })
  @IsNotEmpty({ message: 'El senderId es obligatorio' })
  @IsString()
  senderId: string;

  @ApiProperty({ description: 'Id del usuario que recibe el mensaje', example: '42b83a3b' })
  @IsNotEmpty({ message: 'El receiverId es obligatorio' })
  @IsString()
  receiverId: string;

  @ApiProperty({ description: 'Contenido del mensaje', example: 'Hola, como estas?' })
  @IsNotEmpty({ message: 'El contenido del mensaje es obligatorio' })
  @IsString()
  content: string;
}
