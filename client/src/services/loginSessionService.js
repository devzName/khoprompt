import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const loginSessionService = {
  async getLoginSessions(params = {}) {
    const { page = 1, limit = 20, search, sort_by, sort_order } = params;
    const response = await apiClient.get(API_ENDPOINTS.LOGIN_SESSIONS.LIST, {
      params: { 
        page, 
        limit,
        ...(search && { search }),
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order })
      }
    });
    return response.data;
  },

  async toggleUserStatus(userId) {
    const response = await apiClient.patch(API_ENDPOINTS.LOGIN_SESSIONS.TOGGLE_STATUS(userId));
    return response.data;
  }
};
