import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';
export const voteService = {
  votePrompt: async (promptId, isHelpful) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.VOTES.PROMPTS, {
        prompt_id: promptId,
        is_helpful: isHelpful
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUserVote: async (promptId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VOTES.USER_VOTE(promptId));
      return response.data.vote;
    } catch (error) {
      console.error('Error fetching user vote:', error);
      if (error.response?.status === 404) {
        return null; // User has not voted yet
      }
      return null;
    }
  },
  getPromptVoteStats: async (promptId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VOTES.STATS(promptId));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};