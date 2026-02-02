import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';
export const promptService = {
  getPrompts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.BASE, { params });
    return response.data;
  },
  getMyPrompts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.MY, { params });
    return response.data;
  },
  getPendingPrompts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.PENDING, { params });
    return response.data;
  },
  getAllPrompts: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.ALL, { params });
    return response.data;
  },
  getFeaturedPrompts: async (limit = 6, categoryId = null, tagId = null) => {
    const params = { limit };
    if (categoryId) {
      params.category_id = categoryId;
    }
    if (tagId) {
      params.tag_id = tagId;
    }
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.FEATURED, { params });
    return response.data;
  },
  getPromptById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.BY_ID(id));
    return response.data;
  },
  getPromptBySlug: async (slug) => {
    const response = await apiClient.get(API_ENDPOINTS.PROMPTS.BY_SLUG(slug));
    return response.data;
  },
  createPrompt: async (promptData) => {
    const config = {};
    if (promptData instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      };
    }
    const response = await apiClient.post(API_ENDPOINTS.PROMPTS.BASE, promptData, config);
    return response.data;
  },
  updatePrompt: async (id, promptData) => {
    const config = {};
    if (promptData instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      };
    }
    const response = await apiClient.patch(API_ENDPOINTS.PROMPTS.BY_ID(id), promptData, config);
    return response.data;
  },
  deletePrompt: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.PROMPTS.BY_ID(id));
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
};