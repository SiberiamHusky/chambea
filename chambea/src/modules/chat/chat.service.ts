import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ChatMessage } from './chat-message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatConversationResponseDto } from './dto/chat-conversation-res.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private chatRepository: Repository<ChatMessage>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<ChatMessage> {
    this.logger.debug(`Creating message from ${createMessageDto.senderId} to ${createMessageDto.receiverId}`);
    const message = this.chatRepository.create(createMessageDto);
    const savedMessage = await this.chatRepository.save(message);
    this.logger.log(`Message created with id: ${savedMessage.id}`);
    return savedMessage;
  }

  async getMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    this.logger.debug(`Getting messages between ${userId1} and ${userId2}`);
    return this.chatRepository
      .createQueryBuilder('message')
      .where(
        '(message.senderId = :userId1 AND message.receiverId = :userId2) OR ' +
          '(message.senderId = :userId2 AND message.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async getConversationsForUser(userId: string): Promise<ChatConversationResponseDto[]> {
    this.logger.debug(`Getting conversations for user ${userId}`);
    const messages = await this.chatRepository
      .createQueryBuilder('message')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    const conversationsMap = new Map<string, ChatConversationResponseDto>();

    for (const m of messages) {
      const otherUserId = m.senderId === userId ? m.receiverId : m.senderId;
      if (!conversationsMap.has(otherUserId)) {
        const otherUser = m.senderId === userId ? m.receiver : m.sender;
        const composedName = [otherUser?.first_name, otherUser?.last_name].filter(Boolean).join(' ').trim();
        conversationsMap.set(otherUserId, {
          otherUserId,
          otherUserName: composedName || undefined,
          otherUserEmail: otherUser?.email,
          otherUserType: otherUser?.user_type,
          lastMessageContent: m.content,
          lastMessageAt: m.createdAt,
        });
      }
    }

    return Array.from(conversationsMap.values());
  }
}
