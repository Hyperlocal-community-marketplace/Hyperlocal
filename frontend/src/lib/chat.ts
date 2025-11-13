import api from './api';
import type { Conversation, Message } from '../types';

export const chatService = {
  async createConversation(groupTitle: string, userId: number, sellerId: number): Promise<Conversation> {
    try {
      const response = await api.post('/conversation/create-new-conversation', {
        groupTitle,
        userId,
        sellerId,
      });
      return response.data.conversation;
    } catch (error: any) {
      if (!error.response) {
        throw new Error(`Network error: Unable to reach server. Make sure the backend is running on http://localhost:3000. ${error.message}`);
      }
      throw error;
    }
  },

  async getUserConversations(userId: number): Promise<Conversation[]> {
    const response = await api.get(`/conversation/get-all-conversation-user/${userId}`);
    return response.data.conversations || [];
  },

  async getSellerConversations(sellerId: number): Promise<Conversation[]> {
    try {
      const response = await api.get(`/conversation/get-all-conversation-seller/${sellerId}`);
      return response.data.conversations || [];
    } catch (error: any) {
      if (!error.response) {
        throw new Error(`Network error: Unable to reach server. Make sure the backend is running on http://localhost:3000. ${error.message}`);
      }
      throw error;
    }
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await api.get(`/message/get-all-messages/${conversationId}`);
    return response.data.messages || [];
  },

};


