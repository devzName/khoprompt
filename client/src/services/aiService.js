import apiClient from '../axios/apiClient';
export const aiService = {
  generateText: async (title, type = 'description') => {
    try {
      const response = await apiClient.post('/ai/generate-text', {
        title,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  },
  
  improveText: async (text, value, type = 'description') => {
    try {
      const response = await apiClient.post('/ai/improve-text', {
        text,
        value,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error improving text:', error);
      throw error;
    }
  }
};
export default aiService;