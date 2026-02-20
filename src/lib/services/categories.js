import { createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single Category on Admin side
 * @param {Number} categoryId
 * @returns []
 */
export async function getSingleCategoryAdmin(categoryId) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/categories/${categoryId}`, {
      headers: { Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    return [];
  }
}

/**
 * Get All Categories Options Admin side
 * @returns {Promise<Array>} Array of categories or empty array on error
 */
export async function getAllCategoriesOptionsAdmin() {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get('/api/admin/categorylist', {
      headers: { Accept: 'application/json' },
    });

    // check if request succeeded and response structure is correct
    if (response?.status === 200 && response.data?.success) {
      return response.data.data || []; // return the array of categories
    }

    // fallback if API returns unexpected structure
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);

    // Server/network errors → throw for SWR
    if (error.response) {
      throw new Error(`Server Error ${error.response.status}: ${error.response.data?.message || error.message}`);
    }

    throw new Error(`Network Error: ${error.message}`);
  }
}
