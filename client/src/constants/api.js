export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_ADMIN: '/auth/login/admin',
    LOGIN_GOOGLE: '/auth/login/google',
    ME: '/auth/me',
  },

  PROMPTS: {
    BASE: '/prompts',
    MY: '/prompts/my',
    PENDING: '/prompts/pending',
    FEATURED: '/prompts/featured',
    BY_ID: (id) => `/prompts/${id}`,
    SUBMIT: (id) => `/prompts/${id}/submit`,
    APPROVE: (id) => `/prompts/${id}/approve`,
    REJECT: (id) => `/prompts/${id}/reject`,
    VIEW: (id) => `/prompts/${id}/view`,
    LIKE: (id) => `/prompts/${id}/like`,
    DISLIKE: (id) => `/prompts/${id}/dislike`,
    FEED_LATEST: '/prompts/feed/latest',
  },

  CATEGORIES: {
    BASE: '/prompt-categories',
    STATS: '/prompt-categories/stats',
  },

  TAGS: '/prompt-tags',

  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};