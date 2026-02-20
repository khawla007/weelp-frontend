import { ApiError } from '@/dto/Error';
import { authApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get Single Add On By ID admin
 *
 * @param {string} [id] - Id of Addon
 * @returns {Promise<{
 *   success: boolean,
 *   data: data
 * }>} - The response containing the Single Addon Detail.
 */
export async function getSingleAddOnAdmin(id) {
  try {
    const response = await authApi.get(`/api/admin/addons/${id}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        ...(response?.data || {}),
      };
    }

    return { success: false, data: {} };
  } catch (error) {
    console.error('Error fetching add-ons:', error?.message || error);
    return { success: false, data: {} };
  }
}

/**
 * Fetch all add-ons for admin
 *
 * @param {string} [query=""] - Optional query string (e.g., "?page=1&limit=10")
 * @returns {Promise<{
 *   success: boolean,
 *   data: any[],
 *   total?: number,
 *   current_page?: number,
 *   per_page?: number
 * }>} - The response containing the list of add-ons and pagination details
 */
export async function getAllAddOnsAdmin(query = '') {
  try {
    const response = await authApi.get(`/api/admin/addons${query}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        ...(response?.data || {}),
      };
    }

    return { success: false, data: {} };
  } catch (error) {
    console.error('Error fetching add-ons:', error?.message || error);
    return { success: false, data: {} };
  }
}

/**
 * Get Add On Options (names only) for form handling ***Dropdowns
 * @returns {Promise<{ success: boolean; data: string[] }>}
 */
export async function getAddOnOptionsAdmin() {
  try {
    const response = await authApi.get(`/api/admin/addons/list-addon`, {
      headers: { Accept: 'application/json' },
    });

    if (response.status === 200) {
      return { success: true, data: response?.data?.data };
    }

    return { success: false, data: [] };
  } catch (err) {
    const status = err?.response?.status;

    switch (status) {
      case 422:
        return ApiError({
          message: err.response.data?.message || 'Server side Validation Failed',
          status,
        });
      case 500:
        return ApiError({
          message: err.response.data?.error || 'Internal server error',
          status,
        });
      default:
        return ApiError({ status });
    }
  }
}
