export const ROUTES = {
  HOME: '/',
  CATEGORY: '/category/:category',
  CATEGORY_PATH: (category) => `/category/${category}`,
  PROMPT_DETAIL: '/prompt/:slug',
  PROMPT_DETAIL_PATH: (slug) => `/prompt/${slug}`,
  MY_PROMPTS: '/my-prompts',
  REVIEW_PROMPTS: '/review-prompts',
  MANAGE_PROMPTS: '/manage-prompts',
};

export default ROUTES;