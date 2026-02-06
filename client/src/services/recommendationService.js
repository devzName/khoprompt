import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const recommendationService = {
  getRecommendedPrompts: async (limit = 12) => {
    const response = await apiClient.get(API_ENDPOINTS.RECOMMENDATIONS.RECOMMENDED, {
      params: { limit }
    });
    return response.data;
  },

  chatbotSuggest: async (query, limit = 5) => {
    const response = await apiClient.post(API_ENDPOINTS.RECOMMENDATIONS.CHATBOT, null, {
      params: { query, limit }
    });
    return response.data;
  }
};
