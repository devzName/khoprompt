import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const recommendationService = {
  chatbotSuggest: async (query, sessionId) => {
    const response = await apiClient.post(API_ENDPOINTS.RECOMMENDATIONS.CHATBOT, {
      message: query,
      session_id: sessionId || `user_${Date.now()}`
    });
    return response.data;
  }
};
