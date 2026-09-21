import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Logger, Post, Query, UseGuards } from '@nestjs/common';

import { ChatMessageResponseDto } from './dto/chat-message-res.dto';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatConversationResponseDto } from './dto/chat-conversation-res.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { User } from '../user/user.entity';

@ApiBearerAuth()
@UseGuards(JwtUserAuthGuard)
@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiCreatedResponse({
    description: 'Mensaje creado correctamente',
    type: ChatMessageResponseDto,
  })
  async createMessage(@Body() createMessageDto: CreateMessageDto, @GetUser() user: User): Promise<ChatMessageResponseDto> {
    this.logger.debug(`User ${user.email} is sending a message`);
    const savedMessage = await this.chatService.createMessage(createMessageDto);
    return savedMessage;
  }

  @Get('messages')
  @ApiOkResponse({
    description: 'Listado de mensajes entre dos usuarios',
    type: [ChatMessageResponseDto],
  })
  async getMessages(@Query('fromUserId') fromUserId: string, @Query('toUserId') toUserId: string): Promise<ChatMessageResponseDto[]> {
    this.logger.debug(`Retrieving messages between ${fromUserId} and ${toUserId}`);
    return this.chatService.getMessages(fromUserId, toUserId);
  }

  @Get('conversations')
  @ApiOkResponse({ description: 'Listado de conversaciones del usuario', type: [ChatConversationResponseDto] })
  async getConversations(@GetUser() user: User): Promise<ChatConversationResponseDto[]> {
    this.logger.debug(`Retrieving conversations for ${user._id}`);
    return this.chatService.getConversationsForUser(user._id);
  }
}
