// Application Routes Constants
export const ROUTES = {
  HOME: '/',
  CATEGORY: '/category/:category',
  CATEGORY_PATH: (category) => `/category/${category}`,
  PROMPT_DETAIL: '/prompt/:id',
  PROMPT_DETAIL_PATH: (id) => `/prompt/${id}`,
  MY_PROMPTS: '/my-prompts',
};

export default ROUTES;