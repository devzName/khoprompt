import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const notificationService = {
  getNotifications: async (limit = 10) => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      params: { limit }
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  },
};