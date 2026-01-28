import apiClient from '../axios/apiClient';
export const aiService = {
  formatText: async (text, type = 'description') => {
    try {
      const response = await apiClient.post('/ai/format-text', {
        text,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error formatting text:', error);
      throw error;
    }
  }
};
export default aiService;