import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const skillService = {
  getSkills: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SKILLS.BASE, { params });
    return response.data;
  },
  getMySkills: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.SKILLS.MY, { params });
    return response.data;
  },
  getSkill: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SKILLS.BY_ID(id));
    return response.data;
  },
  createSkill: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.SKILLS.BASE, data);
    return response.data;
  },
  updateSkill: async (id, data) => {
    const response = await apiClient.put(API_ENDPOINTS.SKILLS.BY_ID(id), data);
    return response.data;
  },
  deleteSkill: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.SKILLS.BY_ID(id));
    return response.data;
  },
  getCompilation: async (id, agent) => {
    const response = await apiClient.get(API_ENDPOINTS.SKILLS.COMPILE(id, agent));
    return response.data;
  },
  toggleBookmark: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.SKILLS.BOOKMARK(id));
    return response.data;
  },
  vote: async (id, isHelpful) => {
    const response = await apiClient.post(API_ENDPOINTS.SKILLS.VOTE(id), { is_helpful: isHelpful });
    return response.data;
  },
  removeVote: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.SKILLS.VOTE(id));
    return response.data;
  },
  trackView: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.SKILLS.VIEW(id));
    return response.data;
  },
  getComments: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.SKILLS.COMMENTS(id));
    return response.data;
  },
  addComment: async (id, content, parentId = null) => {
    const response = await apiClient.post(API_ENDPOINTS.SKILLS.COMMENTS(id), {
      content,
      parent_id: parentId,
    });
    return response.data;
  },
  deleteComment: async (id, cid) => {
    const response = await apiClient.delete(API_ENDPOINTS.SKILLS.COMMENT(id, cid));
    return response.data;
  },
};
