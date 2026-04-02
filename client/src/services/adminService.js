import apiClient from '../axios/apiClient';

// Admin-specific API service methods
export const adminService = {
  // GET /admin/settings → full dict; return value for a single key
  getSetting: async (key) => {
    const response = await apiClient.get('/admin/settings');
    return response.data?.[key]?.value ?? null;
  },

  // PUT /admin/settings/{key}
  updateSetting: async (key, value) => {
    const response = await apiClient.put(`/admin/settings/${key}`, {
      value: String(value),
    });
    return response.data;
  },

  // GET /prompts/all with optional filters (reuses existing admin prompt endpoint)
  getAdminPrompts: async (params = {}) => {
    const response = await apiClient.get('/prompts/all', { params });
    return response.data;
  },

  // Delete each prompt individually (no bulk endpoint exists yet)
  bulkDeletePrompts: async (ids = []) => {
    await Promise.all(ids.map((id) => apiClient.delete(`/prompts/${id}`)));
  },

  // GET /admin/audit-logs with optional filters + pagination
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),

  // GET /admin/audit-logs/stats?days=30 → { daily_logins, top_users }
  getAuditLogStats: (days = 30) => apiClient.get('/admin/audit-logs/stats', { params: { days } }),

  // GET /admin/users/{userId}/activity → login history last 90 days
  getUserActivity: (userId) => apiClient.get(`/admin/audit-logs/users/${userId}/activity`),
};

export default adminService;
