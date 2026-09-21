import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { ChatMessageResponseDto } from './dto/chat-message-res.dto';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JoinRoomResponseDto } from './dto/join-room-response.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const token = client.handshake.query.token as string;
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token);
        this.logger.debug(`Authenticated client ${client.id} with payload: ${JSON.stringify(payload)}`);
        client.data.user = payload;
      } catch (error) {
        this.logger.error(`JWT verification failed for client ${client.id}: ${error}`);
        client.disconnect();
      }
    } else {
      this.logger.warn(`No token provided by client ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Evento WebSocket: 'join'
   * Cuerpo del mensaje esperado:
   * {
   *   userId: string;
   * }
   * Respuesta emitida:
   * {
   *   message: string; // Ejemplo: "Te has unido a la sala: user-123"
   * }
   * (Ver DTO JoinRoomResponseDto)
   */
  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket): void {
    client.join(data.userId);
    this.logger.debug(`Client ${client.id} joined room: ${data.userId}`);
    // Emite respuesta con el DTO JoinRoomResponseDto
    const response: JoinRoomResponseDto = { message: `Te has unido a la sala: ${data.userId}` };
    client.emit('joined', response);
  }

  /**
   * Evento WebSocket: 'createMessage'
   * Cuerpo del mensaje esperado: CreateMessageDto
   * Respuesta emitida en evento 'newMessage' con el siguiente formato:
   * (Ver DTO ChatMessageResponseDto)
   *
   * Se envía a las salas del remitente y del receptor.
   */
  @SubscribeMessage('createMessage')
  async handleCreateMessage(@MessageBody() createMessageDto: CreateMessageDto, @ConnectedSocket() client: Socket): Promise<void> {
    this.logger.debug(`Client ${client.id} is creating a message from ${createMessageDto.senderId} to ${createMessageDto.receiverId}`);
    const savedMessage: ChatMessageResponseDto = await this.chatService.createMessage(createMessageDto);
    this.logger.log(`Message created with id: ${savedMessage.id}`);

    // Emite el mensaje a la sala del remitente y a la del receptor
    this.server.to(createMessageDto.senderId).emit('newMessage', savedMessage);
    this.server.to(createMessageDto.receiverId).emit('newMessage', savedMessage);
    this.logger.debug(`Message emitted to rooms ${createMessageDto.senderId} and ${createMessageDto.receiverId}`);
  }
}
