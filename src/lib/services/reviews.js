import { createAuthenticatedServerApi, publicApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get public approved reviews (optional city filter).
 * Used on: Homepage (all), City page (city-filtered).
 * @param {string} [city] - Optional city slug
 * @param {number} [perPage] - Items per page (default 10)
 */
export async function getPublicReviews(city, perPage = 10) {
  try {
    const params = new URLSearchParams({ per_page: String(perPage) });
    if (city) params.set('city', city);
    const response = await publicApi.get(`/api/reviews?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return { success: false, data: [] };
  }
}

/**
 * Get featured approved reviews (optional city filter).
 * Used on: City page featured review slider.
 * @param {string} [city] - Optional city slug
 */
export async function getFeaturedReviews(city) {
  try {
    const url = city ? `/api/reviews/featured-reviews?city=${city}` : '/api/reviews/featured-reviews';
    const response = await publicApi.get(url, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return { success: false, data: [] };
  }
}

/**
 * Get All Reviews Admin
 * @param {string} [search] - Optional search query
 * @returns {Promise<any[]>} - Array of reviews or empty array on error
 */
export async function getAllReviewsAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/reviews/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });
    return response?.data;
  } catch (error) {
    return { success: false, data: [], current_page: 1, per_page: 5, total: 0 };
  }
}

/**
 * Get Single Review Admin
 * @param {string} [id] - Get Single Review By Id
 * @returns {Promise<any[]>} - Array of reviews or empty array on error
 */
export async function getSingleReviewAdmin(id) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/reviews/${id}`, {
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
    console.log('[getAllItemsByTypeOptions] Fetching items for type:', itemType);
    const api = await createAuthenticatedServerApi();
    const url = `/api/admin/reviews/items/?item_type=${itemType}`;
    console.log('[getAllItemsByTypeOptions] Calling URL:', url);
    const response = await api.get(url, {
      headers: { Accept: 'application/json' },
    });

    console.log('[getAllItemsByTypeOptions] Response status:', response.status);
    console.log('[getAllItemsByTypeOptions] Response data:', response?.data);

    if (response.status === 200) {
      return response?.data;
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('[getAllItemsByTypeOptions] Error:', error.message);
    console.error('[getAllItemsByTypeOptions] Error response:', error.response?.data);
    return { success: false, data: [], error: error.message };
  }
}
