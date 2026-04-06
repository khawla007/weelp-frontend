import { cache } from 'react';
import { publicApi } from '../axiosInstance';

/**
 * Get paginated explore creator itineraries for the public feed
 * @param {number} page - Page number
 * @returns {object} Paginated creator itineraries response
 */
export const getExploreCreatorItineraries = cache(async (page = 1) => {
  try {
    const response = await publicApi.get(`/api/explore/creator-itineraries?page=${page}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching explore creator itineraries:', error);
    return { data: [], last_page: 1, current_page: 1 };
  }
});
