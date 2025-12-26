import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const promptTagsService = {
  getTags: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TAGS);
    return response.data;
  },
};