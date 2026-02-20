import { authApi } from '../axiosInstance';

/**
 * Get Single Tag on Admin side
 * @param {Number} tagId
 * @returns []
 */
export async function getSingleTagAdmin(tagId) {
  try {
    const response = await authApi.get(`/api/admin/tags/${tagId}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return [];
  }
}

/**
 * Get All Tags Options Admin side
 * @returns {Promise<Array>} Array of tags or empty array on error
 */
export async function getAllTagsOptionsAdmin() {
  try {
    const response = await authApi.get('/api/admin/taglist', {
      headers: { Accept: 'application/json' },
    });

    // check if request succeeded and response structure is correct
    if (response?.status === 200 && response.data?.success) {
      return response.data.data || []; // return the array of tags
    }

    // fallback if API returns unexpected structure
    return [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
