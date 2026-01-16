export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  PROMPT_DETAIL: '/prompt/:slug',
  PROMPT_DETAIL_PATH: (slug) => `/prompt/${slug}`,
  MY_PROMPTS: '/my-prompts',
  MY_PROMPTS_DASHBOARD: '/my-prompts?tab=dashboard',
  MY_PROMPTS_CREATE: '/my-prompts?tab=create',
  CREATE_PROMPT: '/my-prompts',
};

export default ROUTES;