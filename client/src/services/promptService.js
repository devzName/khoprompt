import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const promptService = {
  getPrompts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.BASE, { params });
    return response.data;
  },

  getPromptById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.BY_ID(id));
    return response.data;
  },

  createPrompt: async (promptData) => {
    const response = await apiClient.post(API_ENDPOINTS.PROMPTS.BASE, promptData);
    return response.data;
  },

  updatePrompt: async (id, promptData) => {
    const response = await apiClient.patch(API_ENDPOINTS.PROMPTS.BY_ID(id), promptData);
    return response.data;
  },

  submitPrompt: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.PROMPTS.SUBMIT(id));
    return response.data;
  },

  approvePrompt: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.PROMPTS.APPROVE(id));
    return response.data;
  },

  rejectPrompt: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.PROMPTS.REJECT(id));
    return response.data;
  },

  registerView: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.PROMPTS.VIEW(id));
    return response.data;
  },

  votePrompt: async (id, value) => {
    const response = await apiClient.post(API_ENDPOINTS.PROMPTS.VOTE(id), null, {
      params: { value }
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
  },

  getTopCategories: async (limit = 5) => {
    const response = await apiClient.get(`${API_ENDPOINTS.CATEGORIES}/top`, { params: { limit } });
    return response.data;
  },

  getTags: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TAGS);
    return response.data;
  },
};