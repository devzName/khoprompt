import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.includes('/auth/login');

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      const detail = error.response?.data?.detail || '';
      // Only redirect if it's an auth failure, not a permission issue on a valid session
      const isAuthFailure = status === 401 || detail === 'Not authenticated';
      if (isAuthFailure) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }

    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);
export default apiClient;