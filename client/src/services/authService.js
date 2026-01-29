import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';
export const authService = {
  login: async (username, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN_ADMIN, {
      username: username,
      password: password,
    });
    return response.data;
  },
  loginWithMicrosoft: async (microsoftToken) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN_MICROSOFT, {
      token: microsoftToken,
    });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },
};