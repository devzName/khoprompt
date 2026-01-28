import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';
export const promptCategoriesService = {
  getCategories: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE);
    return response.data;
  },
  getCategoriesStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.STATS);
    return response.data;
  },
};