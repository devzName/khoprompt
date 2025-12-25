export const ROUTES = {
  HOME: '/',
  CATEGORY: '/category/:category',
  CATEGORY_PATH: (category) => `/category/${category}`,
  PROMPT_DETAIL: '/prompt/:id',
  PROMPT_DETAIL_PATH: (id) => `/prompt/${id}`,
  MY_PROMPTS: '/my-prompts',
  REVIEW_PROMPTS: '/review-prompts',
  MANAGE_PROMPTS: '/manage-prompts',
};

export default ROUTES;