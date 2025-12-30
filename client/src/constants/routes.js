export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  PROMPT_DETAIL: '/prompt/:slug',
  PROMPT_DETAIL_PATH: (slug) => `/prompt/${slug}`,
  MY_PROMPTS: '/my-prompts',
  REVIEW_PROMPTS: '/review-prompts',
  MANAGE_PROMPTS: '/manage-prompts',
};

export default ROUTES;