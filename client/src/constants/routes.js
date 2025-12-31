export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  PROMPT_DETAIL: '/prompt/:slug',
  PROMPT_DETAIL_PATH: (slug) => `/prompt/${slug}`,
  MY_PROMPTS: '/my-prompts',
  CREATE_PROMPT: '/my-prompts',
};

export default ROUTES;