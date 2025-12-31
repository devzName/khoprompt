import apiClient from '../axios/apiClient';

export const statisticsService = {
  // Get general statistics
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Return fallback data if API fails
      return {
        approved_prompts: 0,
        categories: 0,
        total_views: 0,
        total_votes: 0
      };
    }
  }
};