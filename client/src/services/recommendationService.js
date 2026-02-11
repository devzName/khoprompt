import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const recommendationService = {
  chatbotSuggest: async (query, sessionId, chatHistory = []) => {
    const response = await apiClient.post(API_ENDPOINTS.RECOMMENDATIONS.CHATBOT, {
      message: query,
      session_id: sessionId || `user_${Date.now()}`,
      chat_history: chatHistory
    });
    return response.data;
  }
};
