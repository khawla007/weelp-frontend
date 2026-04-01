import { cache } from 'react';
import { publicApi } from '../axiosInstance';

/**
 * Get paginated explore posts for the feed
 * @param {number} page - Page number
 * @returns {object} Paginated posts response
 */
export const getExplorePosts = cache(async (page = 1) => {
  try {
    const response = await publicApi.get(`/api/posts?page=${page}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching explore posts:', error);
    return { data: [], last_page: 1, current_page: 1 };
  }
});

/**
 * Get a single post by ID
 * @param {number} id - Post ID
 * @returns {object} Post data
 */
export const getSinglePost = cache(async (id) => {
  try {
    const response = await publicApi.get(`/api/posts/${id}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
});
