import api from './api';
import type { ChatMessage, ChatResponse, Conversation, ApiResponse } from '../types/index.ts';

export const chatService = {
  async sendMessage(content: string, conversationId?: string, location?: { lat: number; lng: number }): Promise<ApiResponse<ChatResponse>> {
    const response = await api.post<ApiResponse<ChatResponse>>('/chat/send', {
      content,
      conversationId,
      lat: location?.lat,
      lng: location?.lng,
    });
    return response.data;
  },

  async getChatHistory(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
    const response = await api.get<ApiResponse<ChatMessage[]>>(`/chat/history/${conversationId}`);
    return response.data;
  },

  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    const response = await api.get<ApiResponse<Conversation[]>>('/chat/conversations');
    return response.data;
  },

  async createConversation(): Promise<ApiResponse<Conversation>> {
    const response = await api.post<ApiResponse<Conversation>>('/chat/conversations');
    return response.data;
  },

  async deleteConversation(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/chat/conversations/${id}`);
    return response.data;
  },
};
