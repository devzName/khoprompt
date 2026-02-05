import apiClient from '../axios/apiClient';

export const searchService = {
  getSuggestions: async (query, limit = 10) => {
    const response = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  searchPrompts: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.append('q', params.q);
    if (params.tag) searchParams.append('tag', params.tag);
    if (params.category) searchParams.append('category', params.category);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);

    const response = await apiClient.get(`/search?${searchParams.toString()}`);
    return response.data;
  }
};