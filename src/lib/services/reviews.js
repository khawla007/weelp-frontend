import { authApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get All Reviews Admin
 * @param {string} [search] - Optional search query
 * @returns {Promise<any[]>} - Array of reviews or empty array on error
 */
export async function getAllReviewsAdmin(search = '') {
  try {
    const response = await authApi.get(`/api/admin/reviews/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return {};
  }
}

/**
 * Get Single Review Admin
 * @param {string} [id] - Get Single Review By Id
 * @returns {Promise<any[]>} - Array of reviews or empty array on error
 */
export async function getSingleReviewAdmin(id) {
  try {
    const response = await authApi.get(`/api/admin/reviews/${id}`, {
      headers: { Accept: 'application/json' },
    });

    return response?.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, message: 'Item Not Found' };
    }
    return { success: false, message: error.message || 'Something went wrong' };
  }
}

/**
 * Fetch review items by type for form dropdowns.
 *
 * @param {ItemType} itemType - The type of item to fetch ("itinerary" | "activity" | "package")
 * @returns {Promise<{ success: boolean, data: any[] }>} API response with dropdown options
 */
export async function getAllItemsByTypeOptions(itemType) {
  try {
    const response = await authApi.get(`/api/admin/reviews/items/?item_type=${itemType}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return response?.data;
    }
    return {};
  } catch (error) {
    return {};
  }
}
