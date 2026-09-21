import api from './api';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export interface CreateMessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
}

export interface ChatConversation {
  otherUserId: string;
  otherUserName?: string;
  otherUserEmail?: string;
  otherUserType?: 'worker' | 'employer' | 'pending';
  lastMessageContent: string;
  lastMessageAt: string | Date;
}

const chatService = {
  async getMessages(fromUserId: string, toUserId: string): Promise<ChatMessage[]> {
    const res = await api.get('/chat/messages', { params: { fromUserId, toUserId } });
    return res.data;
  },

  async sendMessage(payload: CreateMessagePayload): Promise<ChatMessage> {
    const res = await api.post('/chat/message', payload);
    return res.data;
  },

  async getConversations(): Promise<ChatConversation[]> {
    const res = await api.get('/chat/conversations');
    return res.data;
  },
};

export default chatService;