export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_ADMIN: '/auth/login',
    LOGIN_MICROSOFT: '/auth/login-microsoft',
    ME: '/auth/me',
  },
  PROMPTS: {
    BASE: '/prompts',
    MY: '/prompts/my',
    PENDING: '/prompts/pending',
    ALL: '/prompts/all',
    FEATURED: '/prompts/featured',
    BY_ID: (id) => `/prompts/${id}`,
    BY_SLUG: (slug) => `/prompts/slug/${slug}`,
    SUBMIT: (id) => `/prompts/${id}/submit`,
    APPROVE: (id) => `/prompts/${id}/approve`,
    REJECT: (id) => `/prompts/${id}/reject`,
    VIEW: (id) => `/prompts/${id}/view`,
  },
  VOTES: {
    PROMPTS: '/votes/prompts',
    USER_VOTE: (promptId) => `/votes/prompts/${promptId}/user-vote`,
    STATS: (promptId) => `/votes/prompts/${promptId}/stats`,
  },
  BOOKMARKS: {
    LIST: '/bookmarks',
    CHECK: '/bookmarks/check',
    TOGGLE: '/bookmarks/toggle',
  },
  CATEGORIES: {
    BASE: '/prompt-categories',
    STATS: '/prompt-categories/stats',
    TREE: '/prompt-categories/tree',
  },
  TAGS: '/prompt-tags',
  LOGIN_SESSIONS: {
    LIST: '/login-sessions',
    TOGGLE_STATUS: (userId) => `/login-sessions/${userId}/toggle-status`,
  },
};