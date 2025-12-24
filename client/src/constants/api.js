export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGIN_GOOGLE: '/auth/login/google',
    ME: '/auth/me',
  },

  PROMPTS: {
    BASE: '/prompts',
    BY_ID: (id) => `/prompts/${id}`,
    SUBMIT: (id) => `/prompts/${id}/submit`,
    APPROVE: (id) => `/prompts/${id}/approve`,
    REJECT: (id) => `/prompts/${id}/reject`,
    VIEW: (id) => `/prompts/${id}/view`,
    LIKE: (id) => `/prompts/${id}/like`,
    DISLIKE: (id) => `/prompts/${id}/dislike`,
  },

  CATEGORIES: '/prompt-categories',

  TAGS: '/prompt-tags',

  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};