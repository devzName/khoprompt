// src/services/notificationService.js
import apiClient from '../axios/apiClient';

export const getNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications/me');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error?.response?.status === 404 || error?.response?.status === 401) return [];
    throw error;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await apiClient.put(`/notifications/me/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const archiveNotification = async (notificationId) => {
  try {
    const response = await apiClient.put(`/notifications/me/${notificationId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving notification:', error);
    throw error;
  }
};

export const getAllNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    throw error;
  }
};

export const createNotification = async (notificationData) => {
  try {
    const response = await apiClient.post('/notifications', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const updateNotification = async (notificationId, notificationData) => {
  try {
    const response = await apiClient.put(`/notifications/${notificationId}`, notificationData);
    return response.data;
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getPublicNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications/public');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching public notifications:', error);
    return [];
  }
};