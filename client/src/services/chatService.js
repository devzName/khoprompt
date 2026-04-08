/**
 * Chat API service — wraps all /chat/* endpoints.
 * sendMessageStream returns raw fetch Response for SSE consumption.
 */
import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const chatService = {
  getModels: async () => {
    const res = await apiClient.get(API_ENDPOINTS.CHAT.MODELS);
    return res.data;
  },

  listRooms: async () => {
    const res = await apiClient.get(API_ENDPOINTS.CHAT.ROOMS);
    return res.data;
  },

  createRoom: async (data) => {
    const res = await apiClient.post(API_ENDPOINTS.CHAT.ROOMS, data);
    return res.data;
  },

  updateRoom: async (id, data) => {
    const res = await apiClient.patch(API_ENDPOINTS.CHAT.ROOM(id), data);
    return res.data;
  },

  deleteRoom: async (id) => {
    await apiClient.delete(API_ENDPOINTS.CHAT.ROOM(id));
  },

  getMessages: async (roomId, params = {}) => {
    const res = await apiClient.get(API_ENDPOINTS.CHAT.MESSAGES(roomId), { params });
    return res.data;
  },

  /**
   * Returns a native fetch Response with SSE stream.
   * Pass an AbortSignal to support cancellation.
   */
  sendMessageStream: async (roomId, content, signal) => {
    const token = localStorage.getItem('access_token');
    return fetch(`${BASE_URL}${API_ENDPOINTS.CHAT.SEND(roomId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
      signal,
    });
  },
};
