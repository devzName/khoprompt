import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const bookmarkService = {
  // Get user's bookmarked prompts
  getBookmarkedPrompts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKMARKS.LIST, { params });
    return response.data;
  },

  // Check if prompt is bookmarked
  isBookmarked: async (promptId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.BOOKMARKS.CHECK}/${promptId}`);
    return response.data.is_bookmarked;
  },

  // Toggle bookmark
  toggleBookmark: async (promptId) => {
    const response = await apiClient.post(API_ENDPOINTS.BOOKMARKS.TOGGLE, {
      prompt_id: promptId
    });
    return response.data;
  }
};