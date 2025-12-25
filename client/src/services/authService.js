import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN_ADMIN, {
      email: email,
      password: password,
    });
    return response.data;
  },

  loginWithGoogle: async (idToken) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN_GOOGLE, {
      id_token: idToken,
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