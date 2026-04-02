import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const commentService = {
  /** Fetch all comments (with nested replies) for a prompt. */
  getComments: async (promptId) => {
    const response = await apiClient.get(API_ENDPOINTS.COMMENTS.LIST(promptId));
    return response.data;
  },

  /** Post a new comment or reply. parentId is null for top-level comments. */
  addComment: async (promptId, content, parentId = null) => {
    const response = await apiClient.post(API_ENDPOINTS.COMMENTS.CREATE(promptId), {
      content,
      parent_id: parentId,
    });
    return response.data;
  },

  /** Soft-delete a comment (owner or admin only). */
  deleteComment: async (promptId, commentId) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.COMMENTS.DELETE(promptId, commentId)
    );
    return response.data;
  },
};
